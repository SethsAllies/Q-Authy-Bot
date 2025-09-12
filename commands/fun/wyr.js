export default {
  name: 'wyr',
  aliases: ['wouldyourather'],
  description: 'Would you rather question',
  usage: '!wyr',
  cooldown: 3,
  async execute(message, args, client) {
    const questions = [
      'Would you rather be able to fly or be invisible?',
      'Would you rather have super strength or super speed?',
      'Would you rather live underwater or in space?',
      'Would you rather read minds or see the future?',
      'Would you rather have unlimited money or unlimited time?',
      'Would you rather never have to sleep or never have to eat?',
      'Would you rather be famous or be the smartest person alive?',
      'Would you rather live in the past or the future?',
      'Would you rather have the ability to teleport or time travel?',
      'Would you rather be able to speak all languages or play every instrument?'
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    const embed = {
      color: 0x9b59b6,
      title: '🤔 Would You Rather?',
      description: question,
      footer: { text: 'Choose wisely! 🤷' }
    };
    
    message.reply({ embeds: [embed] });
  }
};