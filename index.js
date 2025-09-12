import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';

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
            client.commands.set(command.default.name, command.default);
            
            // Set aliases
            if (command.default.aliases) {
              command.default.aliases.forEach(alias => {
                client.aliases.set(alias, command.default.name);
              });
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

// Ready event
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers with ${client.users.cache.size} users`);
  
  // Load commands
  await loadCommands();
  
  console.log(`✨ Mega Discord Bot is ready with ${client.commands.size} commands!`);
  
  // Set bot status
  client.user.setActivity('535+ commands | !help', { type: 3 }); // 3 = WATCHING
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