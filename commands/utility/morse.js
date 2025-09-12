export default {
  name: 'morse',
  aliases: [],
  description: 'Convert text to morse code',
  usage: '!morse [text]',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) {
      return message.reply('❌ Please provide text to convert!');
    }
    
    // TODO: Implement morse conversion logic
    message.reply(`🔄 **Morse Conversion:**\n\`\`\`\n${text}\n\`\`\``);
  }
};