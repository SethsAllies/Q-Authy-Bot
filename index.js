import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import database from './services/database.js';
import AutoModService from './services/automod.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

// Collections for commands
client.commands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Collection();
client.slashCommands = new Collection();

// Database and economy (replace in-memory map)
client.database = database;

// AutoMod service
client.automod = new AutoModService(client);

// Bot configuration
client.config = {
  prefix: process.env.BOT_PREFIX || '!',
  token: process.env.DISCORD_TOKEN,
  openaiKey: process.env.OPENAI_API_KEY,
  ownerId: process.env.OWNER_ID || null
};

// Command loader function
async function loadCommands() {
  const commandFolders = ['moderation', 'fun', 'economy', 'music', 'utility', 'ai'];
  const slashCommandsArray = [];
  
  for (const folder of commandFolders) {
    const commandsPath = path.join(process.cwd(), 'commands', folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(commandsPath)) {
      fs.mkdirSync(commandsPath, { recursive: true });
    }
    
    // Load commands from folder
    try {
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      let loadedCount = 0;
      
      for (const file of commandFiles) {
        try {
          const filePath = path.join(commandsPath, file);
          const command = await import(`file://${filePath}`);
          
          if (command.default && command.default.name) {
            // Store both prefix and slash commands
            client.commands.set(command.default.name, command.default);
            client.slashCommands.set(command.default.name, command.default);
            
            // Set aliases for prefix commands
            if (command.default.aliases) {
              command.default.aliases.forEach(alias => {
                client.aliases.set(alias, command.default.name);
              });
            }
            
            // Prepare slash command data (with deduplication)
            const slashData = {
              name: command.default.name,
              description: command.default.description || 'No description provided',
              options: command.default.options || []
            };
            
            // Check for duplicates before adding
            if (!slashCommandsArray.find(cmd => cmd.name === slashData.name)) {
              slashCommandsArray.push(slashData);
            } else {
              console.log(`⚠️ Skipping duplicate slash command: ${slashData.name}`);
            }
            console.log(`✅ Loaded command: ${command.default.name}`);
            loadedCount++;
          } else {
            console.log(`❌ Invalid command structure in ${file}`);
          }
        } catch (error) {
          console.log(`❌ Failed to load ${file}: ${error.message}`);
        }
      }
      
      console.log(`📁 ${folder}: ${loadedCount}/${commandFiles.length} commands loaded`);
    } catch (error) {
      console.log(`📁 Created commands/${folder} folder`);
    }
  }
  
  // Register slash commands
  await registerSlashCommands(slashCommandsArray);
}

// Message handler
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  
  const prefix = client.config.prefix;
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
  if (!command) return;
  
  // Cooldown handling
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }
  
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`Please wait ${timeLeft.toFixed(1)} more seconds before using \`${command.name}\` again.`);
    }
  }
  
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  
  // Execute command
  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(`Error executing command ${command.name}:`, error);
    message.reply('There was an error executing this command!');
  }
});

// Slash command registration
async function registerSlashCommands(commands) {
  const rest = new REST({ version: '10' }).setToken(client.config.token);
  
  try {
    console.log(`🔄 Registering ${commands.length} slash commands...`);
    
    // Register commands globally (takes up to 1 hour)
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log(`✅ Successfully registered ${commands.length} slash commands globally!`);
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
}

// Ready event
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers with ${client.users.cache.size} users`);
  
  // Initialize database
  await database.init();
  
  // Load commands
  await loadCommands();
  
  console.log(`✨ Mega Discord Bot is ready with ${client.commands.size} commands!`);
  
  // Set bot status
  client.user.setActivity('/help or !help', { type: 2 }); // 2 = LISTENING
});

// Slash command interaction handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;
  
  // Check cooldowns
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }
  
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  
  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return interaction.reply({ 
        content: `Please wait ${timeLeft.toFixed(1)} more seconds before using \`${command.name}\` again.`,
        ephemeral: true 
      });
    }
  }
  
  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  
  // Execute command
  try {
    // Convert interaction to message-like object for compatibility
    const fakeMessage = {
      author: interaction.user,
      member: interaction.member,
      guild: interaction.guild,
      channel: interaction.channel,
      mentions: {
        users: new Collection(),
        members: new Collection(),
        roles: new Collection()
      },
      reply: async (content) => {
        if (typeof content === 'string') {
          return interaction.reply({ content, ephemeral: false });
        }
        return interaction.reply({ ...content, ephemeral: false });
      }
    };
    
    // Parse options as args
    const args = [];
    if (interaction.options) {
      interaction.options.data.forEach(option => {
        if (option.type === 6) { // USER
          fakeMessage.mentions.users.set(option.value, option.user);
          fakeMessage.mentions.members.set(option.value, option.member);
          args.push(`<@${option.value}>`);
        } else {
          args.push(option.value.toString());
        }
      });
    }
    
    await command.execute(fakeMessage, args, client);
  } catch (error) {
    console.error(`Error executing slash command ${command.name}:`, error);
    const errorReply = { content: 'There was an error executing this command!', ephemeral: true };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorReply);
    } else {
      await interaction.reply(errorReply);
    }
  }
});

// Button interaction handler for help categories  
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
  
  // Handle chat input commands (already handled above)
  if (interaction.isChatInputCommand()) return;
  
  // Handle button interactions
  if (!interaction.isButton()) return;
  
  const { EmbedBuilder } = await import('discord.js');
  
  if (interaction.customId.startsWith('help_')) {
    const category = interaction.customId.split('_')[1];
    
    if (category === 'home') {
      // Return to main help page
      const totalCommands = client.commands.size;
      
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Q-Mod - 100+ Commands!')
        .setDescription(`Welcome to the ultimate Discord bot with **${totalCommands}** commands across 6 categories!\n\n**Prefix Commands:** Use \`!\` before command names\n**Slash Commands:** Use \`/\` before command names\n\nClick the buttons below to explore commands by category!`)
        .addFields(
          { name: '🛡️ Moderation & Admin', value: 'Ban, kick, mute, warnings, automod, roles, and server management!', inline: true },
          { name: '🎮 Fun & Games', value: 'Games, memes, reactions, rates, trivia, entertainment, and social fun!', inline: true },
          { name: '💰 Economy & Levels', value: 'Work, gambling, shop, inventory, leaderboards, and financial systems!', inline: true },
          { name: '🎶 Music', value: 'Play, pause, queue, volume, playlists, effects, and audio controls!', inline: true },
          { name: '🛠️ Utility', value: 'Weather, translate, reminders, polls, converters, and productivity tools!', inline: true },
          { name: '🤖 AI & Media', value: 'ChatGPT, image generation, analysis, AI tools, and media processing!', inline: true }
        )
        .setFooter({ text: 'Click a category button to see all commands in that category!' })
        .setTimestamp();
      
      return interaction.update({ embeds: [embed] });
    }
    
    // Get commands for specific category
    let categoryCommands = [];
    let categoryName = '';
    let categoryEmoji = '';
    
    switch (category) {
      case 'moderation':
        categoryCommands = Array.from(client.commands.values()).filter(cmd => cmd.category === 'moderation');
        categoryName = 'Moderation & Admin';
        categoryEmoji = '🛡️';
        break;
      case 'fun':
        categoryCommands = Array.from(client.commands.values()).filter(cmd => cmd.category === 'fun');
        categoryName = 'Fun & Games';
        categoryEmoji = '🎮';
        break;
      case 'economy':
        categoryCommands = Array.from(client.commands.values()).filter(cmd => cmd.category === 'economy');
        categoryName = 'Economy & Levels';
        categoryEmoji = '💰';
        break;
      case 'music':
        categoryCommands = Array.from(client.commands.values()).filter(cmd => cmd.category === 'music');
        categoryName = 'Music';
        categoryEmoji = '🎶';
        break;
      case 'utility':
        categoryCommands = Array.from(client.commands.values()).filter(cmd => cmd.category === 'utility');
        categoryName = 'Utility';
        categoryEmoji = '🛠️';
        break;
      case 'ai':
        categoryCommands = Array.from(client.commands.values()).filter(cmd => cmd.category === 'ai');
        categoryName = 'AI & Media';
        categoryEmoji = '🤖';
        break;
      case 'all':
        categoryCommands = Array.from(client.commands.values());
        categoryName = 'All Commands';
        categoryEmoji = '📝';
        break;
      default:
        return interaction.reply({ content: '❌ Unknown category!', ephemeral: true });
    }
    
    // Create command list embed
    const commandList = categoryCommands
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cmd => `\`${cmd.name}\` - ${cmd.description || 'No description'}`)
      .join('\n');
    
    const chunks = [];
    const maxLength = 4000;
    
    if (commandList.length > maxLength) {
      // Split into multiple embeds if too long
      const commands = categoryCommands.sort((a, b) => a.name.localeCompare(b.name));
      const commandsPerPage = 20;
      
      for (let i = 0; i < commands.length; i += commandsPerPage) {
        const pageCommands = commands.slice(i, i + commandsPerPage);
        const pageList = pageCommands.map(cmd => `\`${cmd.name}\` - ${cmd.description || 'No description'}`).join('\n');
        chunks.push(pageList);
      }
    } else {
      chunks.push(commandList);
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${categoryEmoji} ${categoryName} Commands`)
      .setDescription(chunks[0] || 'No commands found in this category.')
      .setFooter({ text: `${categoryCommands.length} commands in this category | Use !help [command] for details` })
      .setTimestamp();
    
    await interaction.update({ embeds: [embed] });
  }
});

// AutoMod Event Handlers
client.on('autoModerationActionExecution', async (execution) => {
  console.log(`🛡️ AutoMod blocked message from ${execution.user.tag} in ${execution.guild.name}`);
  console.log(`Rule: ${execution.ruleTriggerType} | Matched: "${execution.matchedKeyword || execution.matchedContent}"`);
  
  // Optional: Add to audit log or database
  try {
    await client.database.addTransaction(
      execution.user.id,
      0,
      'automod_block',
      `AutoMod blocked message: ${execution.ruleTriggerType}`
    );
  } catch (error) {
    console.error('Failed to log AutoMod action:', error);
  }
});

client.on('autoModerationRuleCreate', (rule) => {
  console.log(`✅ AutoMod rule created: "${rule.name}" in ${rule.guild.name}`);
});

client.on('autoModerationRuleDelete', (rule) => {
  console.log(`🗑️ AutoMod rule deleted: "${rule.name}" in ${rule.guild.name}`);
});

client.on('autoModerationRuleUpdate', (oldRule, newRule) => {
  console.log(`🔄 AutoMod rule updated: "${newRule.name}" in ${newRule.guild.name}`);
});

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Login
if (!client.config.token) {
  console.error('❌ No Discord token found! Please set DISCORD_TOKEN in environment variables.');
  process.exit(1);
}

client.login(client.config.token);