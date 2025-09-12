export default {
  name: 'dare',
  aliases: ['challenge'],
  description: 'Get a dare challenge',
  usage: '!dare',
  cooldown: 3,
  async execute(message, args, client) {
    const dares = [
      'Do 10 jumping jacks',
      'Sing a song in voice chat',
      'Tell a joke in the server',
      'Change your nickname to something funny',
      'Post a funny meme',
      'Do an impression of your favorite character',
      'Write a short poem about pizza',
      'Draw something with your non-dominant hand',
      'Compliment 3 people in the server',
      'Share your most embarrassing moment'
    ];
    
    const dare = dares[Math.floor(Math.random() * dares.length)];
    
    const embed = {
      color: 0xff6b35,
      title: '🔥 Dare Challenge',
      description: dare,
      footer: { text: 'Are you brave enough? 😈' }
    };
    
    message.reply({ embeds: [embed] });
  }
};