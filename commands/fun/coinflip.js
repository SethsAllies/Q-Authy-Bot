export default {
  name: 'coinflip',
  aliases: ['flip', 'coin'],
  description: 'Flip a coin',
  usage: '!coinflip [heads/tails]',
  cooldown: 3,
  async execute(message, args, client) {
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const emoji = result === 'heads' ? '🪙' : '🥇';
    
    if (args[0]) {
      const guess = args[0].toLowerCase();
      if (guess === 'heads' || guess === 'tails') {
        const won = guess === result;
        message.reply(`${emoji} The coin landed on **${result}**! You ${won ? 'won! 🎉' : 'lost! 😢'}`);
        return;
      }
    }
    
    message.reply(`${emoji} The coin landed on **${result}**!`);
  }
};