export default {
  name: 'binary',
  aliases: [],
  description: 'Convert text to binary',
  usage: '!binary [text]',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) {
      return message.reply('❌ Please provide text to convert!');
    }
    
    // TODO: Implement binary conversion logic
    message.reply(`🔄 **Binary Conversion:**\n\`\`\`\n${text}\n\`\`\``);
  }
};