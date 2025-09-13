import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, Partials, AutoModerationRuleTriggerType, AutoModerationActionType, AutoModerationRuleKeywordPresetType } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import AutoModService from './services/automod.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

const prisma = new PrismaClient();

// Initialize AutoMod service
const automod = new AutoModService(client);
client.automod = automod;

// Modmail configuration
const MODMAIL_CONFIG = {
  supportRoleNames: ['Support', 'Staff', 'Moderator', 'Admin'],
  categoryName: 'Modmail Tickets',
  logChannelName: 'modmail-logs',
  autoCloseTime: 24 * 60 * 60 * 1000, // 24 hours
  maxTicketsPerUser: 3
};

// Track active tickets - support multiple tickets per user across guilds
const activeTickets = new Map(); // `${userId}-${guildId}` -> {channelId, guildId, ticketId}
const ticketChannels = new Map(); // channelId -> {userId, ticketId, guildId}
const userTickets = new Map(); // userId -> Array of {channelId, guildId, ticketId}

client.once('ready', async () => {
  console.log(`🎫 Modmail Bot (${client.user.tag}) is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  // Set bot status
  client.user.setPresence({
    activities: [{
      name: 'Sending Your Messages To Admins',
      type: 0 // Playing
    }],
    status: 'online'
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Modmail database connected successfully');
    
    // Load existing tickets into memory
    await loadActiveTickets();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});

// Load active tickets from database
async function loadActiveTickets() {
  try {
    const tickets = await prisma.modmailTicket.findMany({
      where: { status: 'OPEN' }
    });
    
    for (const ticket of tickets) {
      const ticketKey = `${ticket.userId}-${ticket.guildId}`;
      const ticketData = {
        userId: ticket.userId,
        channelId: ticket.channelId,
        guildId: ticket.guildId,
        ticketId: ticket.id
      };
      
      // Check if channel still exists
      const guild = client.guilds.cache.get(ticket.guildId);
      const channel = guild?.channels.cache.get(ticket.channelId);
      
      if (!channel) {
        // Channel was deleted, close the orphaned ticket
        console.log(`⚠️ Orphaned ticket found (channel deleted): ${ticket.id}`);
        await prisma.modmailTicket.update({
          where: { id: ticket.id },
          data: { status: 'CLOSED', closedAt: new Date(), closedBy: 'SYSTEM' }
        });
        continue;
      }
      
      activeTickets.set(ticketKey, ticketData);
      ticketChannels.set(ticket.channelId, {
        userId: ticket.userId,
        ticketId: ticket.id,
        guildId: ticket.guildId
      });
      
      // Track user tickets
      if (!userTickets.has(ticket.userId)) {
        userTickets.set(ticket.userId, []);
      }
      userTickets.get(ticket.userId).push(ticketData);
    }
    
    console.log(`📝 Loaded ${tickets.length} active tickets`);
  } catch (error) {
    console.error('❌ Failed to load active tickets:', error);
  }
}

// Handle DM messages to create/respond to tickets
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Handle DMs (ticket creation/responses)
  if (message.channel.type === ChannelType.DM) {
    await handleDirectMessage(message);
  }
  
  // Handle staff responses in ticket channels
  if (message.guild && ticketChannels.has(message.channel.id)) {
    await handleStaffResponse(message);
  }
  
  // Handle modmail commands in guilds
  if (message.guild && message.content.startsWith('!')) {
    await handleCommand(message);
  }
});

// Handle DM messages from users
async function handleDirectMessage(message) {
  const userId = message.author.id;
  
  // Check if user has active tickets
  if (userTickets.has(userId)) {
    const tickets = userTickets.get(userId);
    
    // Find the most recent active ticket or prompt for selection
    let targetTicket = null;
    
    if (tickets.length === 1) {
      targetTicket = tickets[0];
    } else {
      // For multiple tickets, use the most recently created one
      // In production, you might want to let users choose
      targetTicket = tickets[tickets.length - 1];
    }
    
    if (targetTicket) {
      const guild = client.guilds.cache.get(targetTicket.guildId);
      const channel = guild?.channels.cache.get(targetTicket.channelId);
      
      if (channel) {
        // Forward message to ticket channel
        const embed = new EmbedBuilder()
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL()
          })
          .setDescription(message.content || '*[No text content]*')
          .setColor(0x3498db)
          .setTimestamp();
        
        if (message.attachments.size > 0) {
          embed.addFields({
            name: 'Attachments',
            value: message.attachments.map(att => `[${att.name}](${att.url})`).join('\n')
          });
        }
        
        await channel.send({ embeds: [embed] });
        
        // Save message to database
        await prisma.modmailMessage.create({
          data: {
            ticketId: targetTicket.ticketId,
            authorId: userId,
            content: message.content,
            isFromUser: true,
            attachments: message.attachments.size > 0 ? 
              Array.from(message.attachments.values()).map(att => ({ name: att.name, url: att.url })) : 
              []
          }
        });
        
        // React to show message was received
        await message.react('✅');
        return;
      } else {
        // Channel was deleted, clean up the ticket
        await cleanupOrphanedTicket(targetTicket);
      }
    }
  }
  
  // Create new ticket
  await createNewTicket(message);
}

// Create new modmail ticket
async function createNewTicket(message) {
  const userId = message.author.id;
  
  // Find a guild where the user is a member to create the ticket
  let targetGuild = null;
  for (const guild of client.guilds.cache.values()) {
    try {
      const member = await guild.members.fetch(userId);
      if (member) {
        targetGuild = guild;
        break;
      }
    } catch (error) {
      // User not in this guild, continue
    }
  }
  
  if (!targetGuild) {
    await message.reply('❌ You must be a member of a server where this bot is present to create a ticket.');
    return;
  }
  
  // Check user ticket limit per guild
  const openTicketCount = await prisma.modmailTicket.count({
    where: {
      userId: userId,
      guildId: targetGuild.id,
      status: 'OPEN'
    }
  });
  
  if (openTicketCount >= MODMAIL_CONFIG.maxTicketsPerUser) {
    await message.reply(`❌ You already have the maximum number of open tickets (${MODMAIL_CONFIG.maxTicketsPerUser}) in **${targetGuild.name}**. Please wait for your existing tickets to be resolved.`);
    return;
  }
  
  try {
    // Find or create modmail category
    let category = targetGuild.channels.cache.find(c => 
      c.type === ChannelType.GuildCategory && c.name === MODMAIL_CONFIG.categoryName
    );
    
    if (!category) {
      category = await targetGuild.channels.create({
        name: MODMAIL_CONFIG.categoryName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: targetGuild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });
    }
    
    // Create ticket channel
    const ticketChannel = await targetGuild.channels.create({
      name: `ticket-${message.author.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: targetGuild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        // Add support staff permissions
        ...MODMAIL_CONFIG.supportRoleNames.map(roleName => {
          const role = targetGuild.roles.cache.find(r => r.name === roleName);
          return role ? {
            id: role.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          } : null;
        }).filter(Boolean)
      ]
    });
    
    // Create ticket in database
    const ticket = await prisma.modmailTicket.create({
      data: {
        userId: userId,
        guildId: targetGuild.id,
        channelId: ticketChannel.id,
        status: 'OPEN'
      }
    });
    
    // Add to active tickets with composite key
    const ticketKey = `${userId}-${targetGuild.id}`;
    const ticketData = {
      userId: userId,
      channelId: ticketChannel.id,
      guildId: targetGuild.id,
      ticketId: ticket.id
    };
    
    activeTickets.set(ticketKey, ticketData);
    ticketChannels.set(ticketChannel.id, {
      userId: userId,
      ticketId: ticket.id,
      guildId: targetGuild.id
    });
    
    // Track user tickets
    if (!userTickets.has(userId)) {
      userTickets.set(userId, []);
    }
    userTickets.get(userId).push(ticketData);
    
    // Create ticket embed
    const user = message.author;
    const member = await targetGuild.members.fetch(userId);
    
    const ticketEmbed = new EmbedBuilder()
      .setTitle('🎫 New Modmail Ticket')
      .setDescription(`**User:** ${user} (${user.tag})\n**ID:** ${user.id}\n**Created:** <t:${Math.floor(Date.now() / 1000)}:R>`)
      .setThumbnail(user.displayAvatarURL())
      .setColor(0x2ecc71)
      .addFields(
        {
          name: 'Member Info',
          value: `**Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n**Account Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: true
        },
        {
          name: 'Initial Message',
          value: message.content || '*[No initial message]*',
          inline: false
        }
      );
    
    const actionRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒'),
        new ButtonBuilder()
          .setCustomId('add_staff')
          .setLabel('Add Staff')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('create_transcript')
          .setLabel('Transcript')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📝')
      );
    
    await ticketChannel.send({ 
      embeds: [ticketEmbed], 
      components: [actionRow]
    });
    
    // Save initial message
    await prisma.modmailMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: userId,
        content: message.content,
        isFromUser: true,
        attachments: message.attachments.size > 0 ? 
          Array.from(message.attachments.values()).map(att => ({ name: att.name, url: att.url })) : 
          []
      }
    });
    
    // Confirm to user
    const confirmEmbed = new EmbedBuilder()
      .setTitle('✅ Ticket Created')
      .setDescription(`Your modmail ticket has been created in **${targetGuild.name}**!\n\nA staff member will respond to you shortly. You can continue messaging me here to communicate with the staff.`)
      .setColor(0x2ecc71)
      .setFooter({ text: `Ticket ID: ${ticket.id}` });
    
    await message.reply({ embeds: [confirmEmbed] });
    
    console.log(`🎫 New ticket created: ${user.tag} in ${targetGuild.name}`);
    
  } catch (error) {
    console.error('❌ Failed to create ticket:', error);
    await message.reply('❌ Failed to create ticket. Please try again later.');
  }
}

// Handle staff responses in ticket channels
async function handleStaffResponse(message) {
  if (message.author.bot) return;
  
  const ticketInfo = ticketChannels.get(message.channel.id);
  if (!ticketInfo) return;
  
  // Check if user has staff permissions
  const member = message.member;
  const hasStaffRole = MODMAIL_CONFIG.supportRoleNames.some(roleName => 
    member.roles.cache.some(role => role.name === roleName)
  );
  
  if (!hasStaffRole && !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return; // Not staff
  }
  
  // Don't forward commands
  if (message.content.startsWith('!')) return;
  
  try {
    // Get user
    const user = await client.users.fetch(ticketInfo.userId);
    if (!user) return;
    
    // Create embed for staff response
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${message.author.username} (Staff)`,
        iconURL: message.author.displayAvatarURL()
      })
      .setDescription(message.content || '*[No text content]*')
      .setColor(0xe74c3c)
      .setTimestamp();
    
    if (message.attachments.size > 0) {
      embed.addFields({
        name: 'Attachments',
        value: message.attachments.map(att => `[${att.name}](${att.url})`).join('\n')
      });
    }
    
    // Send to user's DMs
    await user.send({ embeds: [embed] });
    
    // Save message to database
    await prisma.modmailMessage.create({
      data: {
        ticketId: ticketInfo.ticketId,
        authorId: message.author.id,
        content: message.content,
        isFromUser: false,
        attachments: message.attachments.size > 0 ? 
          Array.from(message.attachments.values()).map(att => ({ name: att.name, url: att.url })) : 
          []
      }
    });
    
    // React to confirm message was sent
    await message.react('✅');
    
  } catch (error) {
    console.error('❌ Failed to send staff response:', error);
    await message.react('❌');
  }
}

// Handle modmail commands
async function handleCommand(message) {
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  // Check staff permissions (modmail commands require staff, automod requires manage server)
  const member = message.member;
  const hasStaffRole = MODMAIL_CONFIG.supportRoleNames.some(roleName => 
    member.roles.cache.some(role => role.name === roleName)
  );
  
  const isAutoModCommand = command === 'automod' || command === 'am';
  
  if (isAutoModCommand) {
    // AutoMod commands require Manage Server permission
    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return; // Not authorized for AutoMod
    }
  } else {
    // Other commands require staff role or manage messages
    if (!hasStaffRole && !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return; // Not staff
    }
  }
  
  switch (command) {
    case 'close':
      await closeTicket(message);
      break;
    case 'add':
      await addUserToTicket(message, args);
      break;
    case 'remove':
      await removeUserFromTicket(message, args);
      break;
    case 'transcript':
      await createTranscript(message);
      break;
    case 'tickets':
      await listTickets(message);
      break;
    case 'automod':
    case 'am':
      await handleAutoMod(message, args);
      break;
  }
}

// Close ticket
async function closeTicket(message) {
  const ticketInfo = ticketChannels.get(message.channel.id);
  if (!ticketInfo) {
    await message.reply('❌ This is not a modmail ticket channel.');
    return;
  }
  
  try {
    // Create transcript before closing
    const transcript = await generateTranscript(ticketInfo.ticketId);
    
    // Update ticket status
    await prisma.modmailTicket.update({
      where: { id: ticketInfo.ticketId },
      data: { 
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: message.author.id,
        transcript: transcript
      }
    });
    
    // Remove from active tickets
    const ticketKey = `${ticketInfo.userId}-${ticketInfo.guildId}`;
    activeTickets.delete(ticketKey);
    ticketChannels.delete(message.channel.id);
    
    // Remove from user tickets
    if (userTickets.has(ticketInfo.userId)) {
      const tickets = userTickets.get(ticketInfo.userId);
      const index = tickets.findIndex(t => t.ticketId === ticketInfo.ticketId);
      if (index !== -1) {
        tickets.splice(index, 1);
        if (tickets.length === 0) {
          userTickets.delete(ticketInfo.userId);
        }
      }
    }
    
    // Notify user
    try {
      const user = await client.users.fetch(ticketInfo.userId);
      const embed = new EmbedBuilder()
        .setTitle('🔒 Ticket Closed')
        .setDescription(`Your modmail ticket has been closed by ${message.author}.\n\nIf you need further assistance, feel free to message me again.`)
        .setColor(0x95a5a6)
        .setTimestamp();
      
      await user.send({ embeds: [embed] });
    } catch (error) {
      console.log('Could not DM user about ticket closure');
    }
    
    // Delete channel after 5 seconds
    await message.reply('🔒 Ticket closed. Channel will be deleted in 5 seconds...');
    setTimeout(async () => {
      try {
        await message.channel.delete();
      } catch (error) {
        console.error('Failed to delete ticket channel:', error);
      }
    }, 5000);
    
    console.log(`🔒 Ticket ${ticketInfo.ticketId} closed by ${message.author.tag}`);
    
  } catch (error) {
    console.error('❌ Failed to close ticket:', error);
    await message.reply('❌ Failed to close ticket.');
  }
}

// Generate transcript
async function generateTranscript(ticketId) {
  try {
    const messages = await prisma.modmailMessage.findMany({
      where: { ticketId: ticketId },
      orderBy: { createdAt: 'asc' }
    });
    
    let transcript = `Modmail Ticket #${ticketId} Transcript\n`;
    transcript += `Generated at: ${new Date().toISOString()}\n`;
    transcript += `${'='.repeat(50)}\n\n`;
    
    for (const msg of messages) {
      const timestamp = new Date(msg.createdAt).toLocaleString();
      const author = msg.isFromUser ? 'User' : 'Staff';
      transcript += `[${timestamp}] ${author}: ${msg.content}\n`;
      
      if (msg.attachments && msg.attachments.length > 0) {
        transcript += `   Attachments: ${msg.attachments.map(att => att.url).join(', ')}\n`;
      }
      transcript += '\n';
    }
    
    return transcript;
  } catch (error) {
    console.error('Failed to generate transcript:', error);
    return 'Failed to generate transcript.';
  }
}

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  
  const ticketInfo = ticketChannels.get(interaction.channel.id);
  if (!ticketInfo) {
    await interaction.reply({ content: '❌ This is not a valid modmail ticket channel.', ephemeral: true });
    return;
  }
  
  // Check if user has staff permissions
  const member = interaction.member;
  const hasStaffRole = MODMAIL_CONFIG.supportRoleNames.some(roleName => 
    member.roles.cache.some(role => role.name === roleName)
  );
  
  if (!hasStaffRole && !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({ content: '❌ You do not have permission to use this button.', ephemeral: true });
    return;
  }
  
  switch (interaction.customId) {
    case 'close_ticket':
      await interaction.deferReply();
      try {
        // Create transcript before closing
        const transcript = await generateTranscript(ticketInfo.ticketId);
        
        // Update ticket status
        await prisma.modmailTicket.update({
          where: { id: ticketInfo.ticketId },
          data: { 
            status: 'CLOSED',
            closedAt: new Date(),
            closedBy: interaction.user.id,
            transcript: transcript
          }
        });
        
        // Remove from active tickets
        const ticketKey = `${ticketInfo.userId}-${ticketInfo.guildId}`;
        activeTickets.delete(ticketKey);
        ticketChannels.delete(interaction.channel.id);
        
        // Remove from user tickets
        if (userTickets.has(ticketInfo.userId)) {
          const tickets = userTickets.get(ticketInfo.userId);
          const index = tickets.findIndex(t => t.ticketId === ticketInfo.ticketId);
          if (index !== -1) {
            tickets.splice(index, 1);
            if (tickets.length === 0) {
              userTickets.delete(ticketInfo.userId);
            }
          }
        }
        
        // Notify user
        try {
          const user = await client.users.fetch(ticketInfo.userId);
          const embed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .setDescription(`Your modmail ticket has been closed by ${interaction.user}.\n\nIf you need further assistance, feel free to message me again.`)
            .setColor(0x95a5a6)
            .setTimestamp();
          
          await user.send({ embeds: [embed] });
        } catch (error) {
          console.log('Could not DM user about ticket closure');
        }
        
        // Confirm closure
        await interaction.followUp('🔒 Ticket closed. Channel will be deleted in 5 seconds...');
        setTimeout(async () => {
          try {
            await interaction.channel.delete();
          } catch (error) {
            console.error('Failed to delete ticket channel:', error);
          }
        }, 5000);
        
        console.log(`🔒 Ticket ${ticketInfo.ticketId} closed by ${interaction.user.tag}`);
        
      } catch (error) {
        console.error('❌ Failed to close ticket:', error);
        await interaction.followUp('❌ Failed to close ticket.');
      }
      break;
      
    case 'add_staff':
      await interaction.reply({ 
        content: 'To add staff to this ticket, use the command: `!add @user`',
        ephemeral: true 
      });
      break;
      
    case 'create_transcript':
      await interaction.deferReply({ ephemeral: true });
      try {
        const transcript = await generateTranscript(ticketInfo.ticketId);
        
        // Save transcript to a text file and send it
        const buffer = Buffer.from(transcript, 'utf-8');
        const attachment = {
          attachment: buffer,
          name: `ticket-${ticketInfo.ticketId}-transcript.txt`
        };
        
        await interaction.followUp({
          content: '📝 Here is the transcript for this ticket:',
          files: [attachment],
          ephemeral: true
        });
      } catch (error) {
        console.error('Failed to generate transcript:', error);
        await interaction.followUp({
          content: '❌ Failed to generate transcript.',
          ephemeral: true
        });
      }
      break;
  }
});

// Handle channel deletion
client.on('channelDelete', async (channel) => {
  if (ticketChannels.has(channel.id)) {
    const ticketInfo = ticketChannels.get(channel.id);
    console.log(`📢 Ticket channel deleted: ${channel.name} (ticket #${ticketInfo.ticketId})`);
    
    // Create ticket data for cleanup
    const ticketData = {
      userId: ticketInfo.userId,
      channelId: channel.id,
      guildId: ticketInfo.guildId,
      ticketId: ticketInfo.ticketId
    };
    
    await cleanupOrphanedTicket(ticketData);
  }
});

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Staff command implementations
async function addUserToTicket(message, args) {
  const ticketInfo = ticketChannels.get(message.channel.id);
  if (!ticketInfo) {
    await message.reply('❌ This is not a modmail ticket channel.');
    return;
  }
  
  if (!args[0]) {
    await message.reply('❌ Please mention a user to add. Usage: `!add @user`');
    return;
  }
  
  const userId = args[0].replace(/[<@!>]/g, '');
  const member = await message.guild.members.fetch(userId).catch(() => null);
  
  if (!member) {
    await message.reply('❌ User not found.');
    return;
  }
  
  try {
    await message.channel.permissionOverwrites.create(member, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });
    
    await message.reply(`✅ Added ${member} to this ticket.`);
  } catch (error) {
    console.error('Failed to add user to ticket:', error);
    await message.reply('❌ Failed to add user to ticket.');
  }
}

async function removeUserFromTicket(message, args) {
  const ticketInfo = ticketChannels.get(message.channel.id);
  if (!ticketInfo) {
    await message.reply('❌ This is not a modmail ticket channel.');
    return;
  }
  
  if (!args[0]) {
    await message.reply('❌ Please mention a user to remove. Usage: `!remove @user`');
    return;
  }
  
  const userId = args[0].replace(/[<@!>]/g, '');
  const member = await message.guild.members.fetch(userId).catch(() => null);
  
  if (!member) {
    await message.reply('❌ User not found.');
    return;
  }
  
  try {
    await message.channel.permissionOverwrites.delete(member);
    await message.reply(`✅ Removed ${member} from this ticket.`);
  } catch (error) {
    console.error('Failed to remove user from ticket:', error);
    await message.reply('❌ Failed to remove user from ticket.');
  }
}

async function createTranscript(message) {
  const ticketInfo = ticketChannels.get(message.channel.id);
  if (!ticketInfo) {
    await message.reply('❌ This is not a modmail ticket channel.');
    return;
  }
  
  try {
    const transcript = await generateTranscript(ticketInfo.ticketId);
    const buffer = Buffer.from(transcript, 'utf-8');
    const attachment = {
      attachment: buffer,
      name: `ticket-${ticketInfo.ticketId}-transcript.txt`
    };
    
    await message.reply({
      content: '📝 Here is the transcript for this ticket:',
      files: [attachment]
    });
  } catch (error) {
    console.error('Failed to generate transcript:', error);
    await message.reply('❌ Failed to generate transcript.');
  }
}

async function listTickets(message) {
  try {
    const tickets = await prisma.modmailTicket.findMany({
      where: { 
        guildId: message.guild.id,
        status: 'OPEN'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (tickets.length === 0) {
      await message.reply('📭 No open tickets in this server.');
      return;
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🎫 Open Tickets')
      .setColor(0x3498db)
      .setTimestamp();
    
    let description = '';
    for (const ticket of tickets) {
      const user = await client.users.fetch(ticket.userId).catch(() => null);
      const channel = message.guild.channels.cache.get(ticket.channelId);
      
      description += `**#${ticket.id}** - ${user?.tag || 'Unknown User'}\n`;
      description += `Channel: ${channel || 'Deleted'} | Created: <t:${Math.floor(ticket.createdAt.getTime() / 1000)}:R>\n\n`;
    }
    
    embed.setDescription(description || 'No tickets found.');
    await message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Failed to list tickets:', error);
    await message.reply('❌ Failed to list tickets.');
  }
}

// Clean up orphaned ticket
async function cleanupOrphanedTicket(ticketData) {
  try {
    // Update ticket status to closed
    await prisma.modmailTicket.update({
      where: { id: ticketData.ticketId },
      data: { status: 'CLOSED', closedAt: new Date(), closedBy: 'SYSTEM' }
    });
    
    // Remove from all maps
    const ticketKey = `${ticketData.userId}-${ticketData.guildId}`;
    activeTickets.delete(ticketKey);
    ticketChannels.delete(ticketData.channelId);
    
    if (userTickets.has(ticketData.userId)) {
      const tickets = userTickets.get(ticketData.userId);
      const index = tickets.findIndex(t => t.ticketId === ticketData.ticketId);
      if (index !== -1) {
        tickets.splice(index, 1);
        if (tickets.length === 0) {
          userTickets.delete(ticketData.userId);
        }
      }
    }
    
    console.log(`🧹 Cleaned up orphaned ticket ${ticketData.ticketId}`);
  } catch (error) {
    console.error('Failed to cleanup orphaned ticket:', error);
  }
}

// AutoMod command handler
async function handleAutoMod(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return message.reply('❌ You need **Manage Server** permission to use AutoMod commands!');
  }

  const subcommand = args[0]?.toLowerCase();
  
  if (!subcommand) {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('🛡️ AutoMod Management')
      .setDescription('Discord\'s native AutoMod system for advanced moderation')
      .addFields(
        { name: '🔧 Setup', value: '`!automod setup` - Quick setup with basic protection', inline: true },
        { name: '📋 List', value: '`!automod list` - View all active rules', inline: true },
        { name: '📊 Stats', value: '`!automod stats` - View AutoMod statistics', inline: true },
        { name: '🗑️ Delete', value: '`!automod delete <id>` - Delete a rule', inline: true },
        { name: '⚡ Presets', value: 'Spam, Bad Words, Mention Spam, Links, Caps', inline: true },
        { name: '🏆 Badge', value: 'Bots with 100+ rules get AutoMod badge!', inline: true }
      )
      .setFooter({ text: 'Q-Mail AutoMod integration • Uses Discord native API' });
    
    return message.reply({ embeds: [embed] });
  }

  try {
    switch (subcommand) {
      case 'setup':
        await handleAutoModSetup(message, args);
        break;
      case 'list':
        await handleAutoModList(message);
        break;
      case 'stats':
        await handleAutoModStats(message);
        break;
      case 'delete':
        await handleAutoModDelete(message, args);
        break;
      default:
        message.reply('❌ Unknown subcommand. Use `!automod` for help.');
    }
  } catch (error) {
    console.error('AutoMod command error:', error);
    message.reply('❌ An error occurred while managing AutoMod rules.');
  }
}

// AutoMod setup handler
async function handleAutoModSetup(message, args) {
  const logChannel = message.mentions.channels.first();
  
  const embed = new EmbedBuilder()
    .setColor(0xffaa00)
    .setTitle('🔄 Setting up AutoMod Protection...')
    .setDescription('Creating basic protection rules (Spam, Bad Words, Mentions)');
  
  const msg = await message.reply({ embeds: [embed] });
  
  try {
    const results = await automod.setupBasicProtection(
      message.guild.id,
      logChannel?.id
    );
    
    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    const resultEmbed = new EmbedBuilder()
      .setColor(success > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('✅ AutoMod Setup Complete!')
      .setDescription(`Successfully created **${success}** AutoMod rules${failed > 0 ? ` (${failed} failed)` : ''}`)
      .addFields(
        { name: '🛡️ Active Protection', value: results.filter(r => r.success).map(r => r.preset.replace('_', ' ')).join('\n') || 'None', inline: true },
        { name: '📊 Rule Count', value: `${success} rules created`, inline: true },
        { name: '🏆 Badge Progress', value: 'Use `!automod stats` to check badge eligibility', inline: true }
      );

    if (logChannel) {
      resultEmbed.addFields({ name: '📝 Log Channel', value: logChannel.toString(), inline: true });
    }
    
    await msg.edit({ embeds: [resultEmbed] });
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Setup Failed')
      .setDescription('Failed to create AutoMod rules. Check bot permissions.');
    
    await msg.edit({ embeds: [errorEmbed] });
  }
}

// AutoMod list handler
async function handleAutoModList(message) {
  try {
    const rules = await automod.getGuildRules(message.guild.id);
    
    if (rules.size === 0) {
      return message.reply('📋 No AutoMod rules found. Use `!automod setup` to get started!');
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`🛡️ AutoMod Rules (${rules.size})`);
    
    const ruleList = Array.from(rules.values())
      .map(rule => `${rule.enabled ? '🟢' : '🔴'} **${rule.name}** \`(ID: ${rule.id})\``)
      .join('\n');
    
    embed.setDescription(ruleList || 'No rules found');
    embed.setFooter({ text: `${rules.size} total rules • Use !automod delete <id> to remove` });
    
    message.reply({ embeds: [embed] });
  } catch (error) {
    message.reply('❌ Failed to fetch AutoMod rules.');
  }
}

// AutoMod stats handler
async function handleAutoModStats(message) {
  try {
    const stats = await automod.getRuleStats();
    
    const embed = new EmbedBuilder()
      .setColor(stats.badgeEligible ? 0x00ff00 : 0xffaa00)
      .setTitle('📊 AutoMod Statistics')
      .addFields(
        { name: '🛡️ Total Rules', value: stats.totalRules.toString(), inline: true },
        { name: '🏠 Servers', value: stats.guildCount.toString(), inline: true },
        { name: '📈 Average/Server', value: stats.averageRulesPerGuild.toString(), inline: true },
        { 
          name: '🏆 Badge Status', 
          value: stats.badgeEligible 
            ? '✅ **Eligible for AutoMod Badge!**' 
            : `❌ Need ${100 - stats.totalRules} more rules`, 
          inline: false 
        }
      )
      .setFooter({ text: 'Discord awards AutoMod badges to bots with 100+ rules across all servers' });
    
    message.reply({ embeds: [embed] });
  } catch (error) {
    message.reply('❌ Failed to fetch AutoMod statistics.');
  }
}

// AutoMod delete handler
async function handleAutoModDelete(message, args) {
  const ruleId = args[1];
  if (!ruleId) {
    return message.reply('❌ Please provide a rule ID. Use `!automod list` to see rule IDs.');
  }
  
  try {
    await automod.deleteRule(message.guild.id, ruleId);
    message.reply(`✅ Successfully deleted AutoMod rule ID: \`${ruleId}\``);
  } catch (error) {
    message.reply('❌ Failed to delete rule. Check the rule ID is correct.');
  }
}

// Start the modmail bot
client.login(process.env.DISCORD_TOKEN1);