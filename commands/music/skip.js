export default {
  name: 'skip',
  aliases: ['next', 'fs'],
  description: 'Skip current song',
  usage: '!skip',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ You must be in a voice channel!');
    }
    
    // Placeholder for music functionality
    message.reply('⏭️ **Skipped current song!**\n*Note: Full music functionality requires additional setup*');
  }
};