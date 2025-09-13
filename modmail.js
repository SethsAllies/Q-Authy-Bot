import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: ['CHANNEL', 'MESSAGE']
});

const prisma = new PrismaClient();

// Modmail configuration
const MODMAIL_CONFIG = {
  supportRoleNames: ['Support', 'Staff', 'Moderator', 'Admin'],
  categoryName: 'Modmail Tickets',
  logChannelName: 'modmail-logs',
  autoCloseTime: 24 * 60 * 60 * 1000, // 24 hours
  maxTicketsPerUser: 3
};

// Track active tickets
const activeTickets = new Map(); // userId -> {channelId, guildId, ticketId}
const ticketChannels = new Map(); // channelId -> {userId, ticketId, guildId}

client.once('ready', async () => {
  console.log(`🎫 Modmail Bot (${client.user.tag}) is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
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
      activeTickets.set(ticket.userId, {
        channelId: ticket.channelId,
        guildId: ticket.guildId,
        ticketId: ticket.id
      });
      
      ticketChannels.set(ticket.channelId, {
        userId: ticket.userId,
        ticketId: ticket.id,
        guildId: ticket.guildId
      });
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
  
  // Check if user already has an active ticket
  if (activeTickets.has(userId)) {
    const ticket = activeTickets.get(userId);
    const guild = client.guilds.cache.get(ticket.guildId);
    const channel = guild?.channels.cache.get(ticket.channelId);
    
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
          ticketId: ticket.ticketId,
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
  
  // Check user ticket limit
  const userTickets = await prisma.modmailTicket.count({
    where: {
      userId: userId,
      status: 'OPEN'
    }
  });
  
  if (userTickets >= MODMAIL_CONFIG.maxTicketsPerUser) {
    await message.reply(`❌ You already have the maximum number of open tickets (${MODMAIL_CONFIG.maxTicketsPerUser}). Please wait for your existing tickets to be resolved.`);
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
    
    // Add to active tickets
    activeTickets.set(userId, {
      channelId: ticketChannel.id,
      guildId: targetGuild.id,
      ticketId: ticket.id
    });
    
    ticketChannels.set(ticketChannel.id, {
      userId: userId,
      ticketId: ticket.id,
      guildId: targetGuild.id
    });
    
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
  
  // Check staff permissions
  const member = message.member;
  const hasStaffRole = MODMAIL_CONFIG.supportRoleNames.some(roleName => 
    member.roles.cache.some(role => role.name === roleName)
  );
  
  if (!hasStaffRole && !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return; // Not staff
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
    activeTickets.delete(ticketInfo.userId);
    ticketChannels.delete(message.channel.id);
    
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
  if (!ticketInfo) return;
  
  switch (interaction.customId) {
    case 'close_ticket':
      await interaction.deferReply();
      // Simulate close command
      const fakeMessage = {
        channel: interaction.channel,
        author: interaction.user,
        reply: (content) => interaction.followUp(content)
      };
      await closeTicket(fakeMessage);
      break;
      
    case 'create_transcript':
      await interaction.deferReply({ ephemeral: true });
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
      break;
  }
});

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Start the modmail bot
client.login(process.env.DISCORD_TOKEN1);