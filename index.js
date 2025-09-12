import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import database from './services/database.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages
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
  client.user.setActivity('535+ commands | /help or !help', { type: 3 }); // 3 = WATCHING
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