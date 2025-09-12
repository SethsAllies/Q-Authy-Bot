export default {
  name: 'pause',
  aliases: ['stop'],
  description: 'Pause current song',
  usage: '!pause',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ You must be in a voice channel!');
    }
    
    // Placeholder for music functionality
    message.reply('⏸️ **Music paused!**\n*Note: Full music functionality requires additional setup*');
  }
};