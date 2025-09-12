export default {
  name: 'dice',
  aliases: ['roll', 'die'],
  description: 'Roll dice',
  usage: '!dice [2d6] or !dice',
  cooldown: 3,
  async execute(message, args, client) {
    let numDice = 1;
    let numSides = 6;
    
    if (args[0]) {
      const diceMatch = args[0].match(/^(\d+)d(\d+)$/);
      if (diceMatch) {
        numDice = Math.min(parseInt(diceMatch[1]), 10);
        numSides = Math.min(parseInt(diceMatch[2]), 100);
      } else {
        numSides = Math.min(parseInt(args[0]) || 6, 100);
      }
    }
    
    const results = [];
    let total = 0;
    
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * numSides) + 1;
      results.push(roll);
      total += roll;
    }
    
    const resultText = numDice > 1 ? 
      `🎲 Rolled ${numDice}d${numSides}: [${results.join(', ')}] = **${total}**` :
      `🎲 Rolled d${numSides}: **${results[0]}**`;
    
    message.reply(resultText);
  }
};