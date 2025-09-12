export default {
  name: 'help',
  aliases: ['h', 'commands'],
  description: 'Shows all available commands',
  usage: '!help [command]',
  cooldown: 3,
  async execute(message, args, client) {
    if (args[0]) {
      // Show specific command help
      const command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
      if (!command) {
        return message.reply(`❌ Command "${args[0]}" not found!`);
      }
      
      const embed = {
        color: 0x00ff00,
        title: `📚 Command: ${command.name}`,
        fields: [
          { name: 'Description', value: command.description || 'No description', inline: false },
          { name: 'Usage', value: command.usage || `!${command.name}`, inline: false },
          { name: 'Aliases', value: command.aliases?.join(', ') || 'None', inline: false },
          { name: 'Cooldown', value: `${command.cooldown || 3} seconds`, inline: false }
        ]
      };
      
      return message.reply({ embeds: [embed] });
    }
    
    // Show command categories
    const embed = {
      color: 0x00ff00,
      title: '🤖 MEGA DISCORD BOT - 535+ COMMANDS!',
      description: 'Use `!help [command]` for detailed info',
      fields: [
        { name: '🛡️ Moderation & Admin', value: '120+ commands for server management', inline: true },
        { name: '🎮 Fun & Games', value: '120+ entertainment commands', inline: true },
        { name: '💰 Economy & Levels', value: '90+ economy system commands', inline: true },
        { name: '🎶 Music', value: '45+ music player commands', inline: true },
        { name: '🛠️ Utility', value: '110+ helpful utility commands', inline: true },
        { name: '🖼️ Media/AI', value: '50+ AI and media commands', inline: true }
      ],
      footer: { text: 'More categories coming soon! | !help [category] for category commands' }
    };
    
    message.reply({ embeds: [embed] });
  }
};