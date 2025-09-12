export default {
  name: 'truth',
  aliases: ['truthordare'],
  description: 'Get a truth question',
  usage: '!truth',
  cooldown: 3,
  async execute(message, args, client) {
    const truths = [
      'What is your biggest fear?',
      'What is your most embarrassing moment?',
      'Who was your first crush?',
      'What is something you have never told anyone?',
      'What is your biggest regret?',
      'What is the weirdest thing you have ever eaten?',
      'What is your most embarrassing habit?',
      'What is something you wish you could change about yourself?',
      'What is the worst thing you have ever done?',
      'What is your biggest secret?'
    ];
    
    const truth = truths[Math.floor(Math.random() * truths.length)];
    
    const embed = {
      color: 0x4a90e2,
      title: '🤔 Truth Question',
      description: truth,
      footer: { text: 'Be honest! 😊' }
    };
    
    message.reply({ embeds: [embed] });
  }
};