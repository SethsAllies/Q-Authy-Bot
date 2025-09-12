export default {
  name: 'reverse',
  aliases: [],
  description: 'Reverse text',
  usage: '!reverse [text]',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) {
      return message.reply('❌ Please provide text to convert!');
    }
    
    // TODO: Implement reverse conversion logic
    message.reply(`🔄 **Reverse Conversion:**\n\`\`\`\n${text}\n\`\`\``);
  }
};