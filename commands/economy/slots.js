export default {
  name: 'slots',
  aliases: ['slot', 'spin'],
  description: 'Play slot machine',
  usage: '!slots [bet]',
  cooldown: 5,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const userId = message.author.id;
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0 };
    
    let bet = parseInt(args[0]) || 50;
    
    if (bet < 10) return message.reply('❌ Minimum bet is $10!');
    if (bet > userData.wallet) return message.reply('❌ You don\'t have enough money!');
    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
    const results = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    
    let winnings = 0;
    let message_text = '';
    
    if (results[0] === results[1] && results[1] === results[2]) {
      // Jackpot!
      if (results[0] === '💎') {
        winnings = bet * 10;
        message_text = '💎 MEGA JACKPOT! 💎';
      } else if (results[0] === '7️⃣') {
        winnings = bet * 7;
        message_text = '🎰 LUCKY 7s! 🎰';
      } else {
        winnings = bet * 3;
        message_text = '🎉 Triple Match! 🎉';
      }
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      winnings = bet * 1.5;
      message_text = '✨ Double Match! ✨';
    } else {
      winnings = 0;
      message_text = '💸 No match... Try again!';
    }
    
    userData.wallet -= bet;
    userData.wallet += winnings;
    client.economy.set(userId, userData);
    
    const embed = {
      color: winnings > bet ? 0x00ff00 : 0xff0000,
      title: '🎰 Slot Machine',
      description: `[ ${results.join(' | ')} ]\n\n${message_text}`,
      fields: [
        { name: '💰 Bet', value: `$${bet}`, inline: true },
        { name: '🎁 Winnings', value: `$${winnings}`, inline: true },
        { name: '💳 New Balance', value: `$${userData.wallet}`, inline: true }
      ]
    };
    
    message.reply({ embeds: [embed] });
  }
};