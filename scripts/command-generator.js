#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Command templates
const templates = {
  basic: (name, category, description) => `export default {
  name: '${name}',
  aliases: [],
  description: '${description}',
  usage: '!${name}',
  cooldown: 3,
  category: '${category}',
  async execute(message, args, client) {
    // TODO: Implement ${name} command logic
    message.reply('🚧 This command is under construction!');
  }
};`,

  economy: (name, description) => `export default {
  name: '${name}',
  aliases: [],
  description: '${description}',
  usage: '!${name}',
  cooldown: 30,
  category: 'economy',
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, '${name}');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(\`⏰ You need to wait \${minutes} more minutes before using this command!\`);
    }
    
    // TODO: Implement ${name} economy logic
    const earnings = Math.floor(Math.random() * 100) + 50;
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, earnings, null, 'increment');
    await client.database.setCooldown(userId, '${name}', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, '${name}', '${description}');
    
    message.reply(\`💰 You earned **$\${earnings}** from ${name}!\`);
  }
};`,

  moderation: (name, description, permission) => `export default {
  name: '${name}',
  aliases: [],
  description: '${description}',
  usage: '!${name} @user [reason]',
  cooldown: 3,
  category: 'moderation',
  async execute(message, args, client) {
    if (!message.member.permissions.has('${permission}')) {
      return message.reply('❌ You need ${permission} permission to use this command!');
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('❌ Please mention a user!');
    }
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    // TODO: Implement ${name} moderation logic
    message.reply(\`✅ Successfully applied ${name} to **\${target.user.username}** for: \${reason}\`);
  }
};`,

  fun: (name, description) => `export default {
  name: '${name}',
  aliases: [],
  description: '${description}',
  usage: '!${name}',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    // TODO: Implement ${name} fun command logic
    const responses = [
      '🎉 Fun response 1!',
      '😄 Fun response 2!',
      '🎮 Fun response 3!'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    message.reply(randomResponse);
  }
};`,

  utility: (name, description) => `export default {
  name: '${name}',
  aliases: [],
  description: '${description}',
  usage: '!${name}',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    // TODO: Implement ${name} utility logic
    const embed = {
      color: 0x0099ff,
      title: '🔧 ${name.charAt(0).toUpperCase() + name.slice(1)}',
      description: '${description}',
      timestamp: new Date(),
      footer: { text: 'Mega Discord Bot' }
    };
    
    message.reply({ embeds: [embed] });
  }
};`
};

// Command factory for generating similar commands
class CommandFactory {
  // Generate reaction commands (hug, kiss, pat, etc.)
  static generateReactionCommands() {
    const reactions = [
      { name: 'bite', description: 'Bite someone playfully', emoji: '🦷' },
      { name: 'bonk', description: 'Bonk someone', emoji: '🔨' },
      { name: 'cuddle', description: 'Cuddle with someone', emoji: '🤗' },
      { name: 'dance', description: 'Dance with someone', emoji: '💃' },
      { name: 'feed', description: 'Feed someone', emoji: '🍎' },
      { name: 'highfive', description: 'Give someone a high five', emoji: '🙏' },
      { name: 'hold', description: 'Hold someone\'s hand', emoji: '🤝' },
      { name: 'kick', description: 'Kick someone playfully', emoji: '🦵' },
      { name: 'lick', description: 'Lick someone (weird but ok)', emoji: '👅' },
      { name: 'nom', description: 'Nom on someone', emoji: '😋' },
      { name: 'poke', description: 'Poke someone', emoji: '👉' },
      { name: 'tackle', description: 'Tackle someone', emoji: '🤼' },
      { name: 'tickle', description: 'Tickle someone', emoji: '🤗' },
      { name: 'wave', description: 'Wave at someone', emoji: '👋' }
    ];

    return reactions.map(reaction => ({
      filename: `${reaction.name}.js`,
      content: `export default {
  name: '${reaction.name}',
  aliases: [],
  description: '${reaction.description}',
  usage: '!${reaction.name} @user',
  cooldown: 3,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    
    if (target.id === message.author.id) {
      return message.reply(\`${reaction.emoji} You ${reaction.name} yourself! How cute!\`);
    }
    
    message.reply(\`${reaction.emoji} **\${message.author.username}** ${reaction.name}s **\${target.username}**!\`);
  }
};`
    }));
  }

  // Generate rate commands (coolrate, smartrate, etc.)
  static generateRateCommands() {
    const rates = [
      { name: 'coolrate', description: 'Rate how cool someone is', emoji: '😎' },
      { name: 'curate', description: 'Rate how cute someone is', emoji: '🥰' },
      { name: 'funnyrate', description: 'Rate how funny someone is', emoji: '😂' },
      { name: 'kindrate', description: 'Rate how kind someone is', emoji: '😇' },
      { name: 'smartrate', description: 'Rate how smart someone is', emoji: '🧠' },
      { name: 'weirdrate', description: 'Rate how weird someone is', emoji: '🤪' }
    ];

    return rates.map(rate => ({
      filename: `${rate.name}.js`,
      content: `export default {
  name: '${rate.name}',
  aliases: [],
  description: '${rate.description}',
  usage: '!${rate.name} [@user]',
  cooldown: 5,
  category: 'fun',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const rating = Math.floor(Math.random() * 101);
    
    let ratingText = '';
    if (rating < 20) ratingText = 'Very Low';
    else if (rating < 40) ratingText = 'Low';
    else if (rating < 60) ratingText = 'Medium';
    else if (rating < 80) ratingText = 'High';
    else ratingText = 'Very High';
    
    message.reply(\`${rate.emoji} **\${target.username}**'s ${rate.name.replace('rate', '')} rating is **\${rating}%** (\${ratingText})!\`);
  }
};`
    }));
  }

  // Generate converter commands (temperature, currency, etc.)
  static generateConverterCommands() {
    const converters = [
      { name: 'base64', description: 'Encode/decode base64 text' },
      { name: 'binary', description: 'Convert text to binary' },
      { name: 'hex', description: 'Convert text to hexadecimal' },
      { name: 'morse', description: 'Convert text to morse code' },
      { name: 'reverse', description: 'Reverse text' },
      { name: 'uppercase', description: 'Convert text to uppercase' },
      { name: 'lowercase', description: 'Convert text to lowercase' }
    ];

    return converters.map(converter => ({
      filename: `${converter.name}.js`,
      content: `export default {
  name: '${converter.name}',
  aliases: [],
  description: '${converter.description}',
  usage: '!${converter.name} [text]',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) {
      return message.reply('❌ Please provide text to convert!');
    }
    
    // TODO: Implement ${converter.name} conversion logic
    message.reply(\`🔄 **${converter.name.charAt(0).toUpperCase() + converter.name.slice(1)} Conversion:**\\n\\\`\\\`\\\`\\n\${text}\\n\\\`\\\`\\\`\`);
  }
};`
    }));
  }
}

// CLI interface
function showHelp() {
  console.log(`
🚀 Discord Bot Command Generator

Usage:
  node command-generator.js <type> <name> [options]

Types:
  basic <name> <category> <description>     - Generate basic command
  economy <name> <description>              - Generate economy command  
  moderation <name> <description> <perm>    - Generate moderation command
  fun <name> <description>                  - Generate fun command
  utility <name> <description>             - Generate utility command
  
Batch Generation:
  node command-generator.js batch reactions  - Generate all reaction commands
  node command-generator.js batch rates      - Generate all rate commands  
  node command-generator.js batch converters - Generate all converter commands

Examples:
  node command-generator.js basic test fun "A test command"
  node command-generator.js economy mine "Mine for coins"
  node command-generator.js batch reactions
`);
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }

  const type = args[0];
  
  if (type === 'batch') {
    const batchType = args[1];
    let commands = [];
    
    switch (batchType) {
      case 'reactions':
        commands = CommandFactory.generateReactionCommands();
        break;
      case 'rates':
        commands = CommandFactory.generateRateCommands();
        break;
      case 'converters':
        commands = CommandFactory.generateConverterCommands();
        break;
      default:
        console.log('❌ Unknown batch type. Use: reactions, rates, or converters');
        return;
    }
    
    // Write batch commands
    commands.forEach(cmd => {
      const filePath = path.join(__dirname, '..', 'commands', 'fun', cmd.filename);
      fs.writeFileSync(filePath, cmd.content);
      console.log(`✅ Generated: ${cmd.filename}`);
    });
    
    console.log(`🎉 Generated ${commands.length} ${batchType} commands!`);
    return;
  }

  const name = args[1];
  if (!name) {
    console.log('❌ Command name is required');
    return;
  }

  let content = '';
  let category = 'utility';

  switch (type) {
    case 'basic':
      category = args[2] || 'utility';
      const description = args[3] || 'A basic command';
      content = templates.basic(name, category, description);
      break;
    case 'economy':
      category = 'economy';
      content = templates.economy(name, args[2] || 'An economy command');
      break;
    case 'moderation':
      category = 'moderation';
      content = templates.moderation(name, args[2] || 'A moderation command', args[3] || 'ModerateMembers');
      break;
    case 'fun':
      category = 'fun';
      content = templates.fun(name, args[2] || 'A fun command');
      break;
    case 'utility':
      category = 'utility';
      content = templates.utility(name, args[2] || 'A utility command');
      break;
    default:
      console.log('❌ Unknown command type');
      showHelp();
      return;
  }

  // Write command file
  const filePath = path.join(__dirname, '..', 'commands', category, `${name}.js`);
  fs.writeFileSync(filePath, content);
  console.log(`✅ Generated: commands/${category}/${name}.js`);
}

main();