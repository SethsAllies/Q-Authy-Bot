export default {
  name: 'hex',
  aliases: [],
  description: 'Convert text to hexadecimal',
  usage: '!hex [text]',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) {
      return message.reply('❌ Please provide text to convert!');
    }
    
    // TODO: Implement hex conversion logic
    message.reply(`🔄 **Hex Conversion:**\n\`\`\`\n${text}\n\`\`\``);
  }
};