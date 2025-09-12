export default {
  name: 'base64',
  aliases: [],
  description: 'Encode/decode base64 text',
  usage: '!base64 [text]',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) {
      return message.reply('❌ Please provide text to convert!');
    }
    
    // TODO: Implement base64 conversion logic
    message.reply(`🔄 **Base64 Conversion:**\n\`\`\`\n${text}\n\`\`\``);
  }
};