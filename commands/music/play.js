export default {
  name: 'play',
  aliases: ['p', 'music'],
  description: 'Play music in voice channel',
  usage: '!play [song name/URL]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ You must be in a voice channel to use this command!');
    }
    
    if (!args.length) {
      return message.reply('❌ Please provide a song name or URL!');
    }
    
    const song = args.join(' ');
    
    // Placeholder for music functionality
    message.reply(`🎵 **Now playing:** ${song}\n*Note: Full music functionality requires additional setup*`);
  }
};