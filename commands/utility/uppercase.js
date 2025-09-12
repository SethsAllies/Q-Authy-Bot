export default {
  name: 'uppercase',
  aliases: [],
  description: 'Convert text to uppercase',
  usage: '!uppercase [text]',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) {
      return message.reply('❌ Please provide text to convert!');
    }
    
    // TODO: Implement uppercase conversion logic
    message.reply(`🔄 **Uppercase Conversion:**\n\`\`\`\n${text}\n\`\`\``);
  }
};