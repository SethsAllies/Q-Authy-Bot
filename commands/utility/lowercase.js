export default {
  name: 'lowercase',
  aliases: [],
  description: 'Convert text to lowercase',
  usage: '!lowercase [text]',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) {
      return message.reply('❌ Please provide text to convert!');
    }
    
    // TODO: Implement lowercase conversion logic
    message.reply(`🔄 **Lowercase Conversion:**\n\`\`\`\n${text}\n\`\`\``);
  }
};