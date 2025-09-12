export default {
  name: 'blackjack',
  aliases: ['bj', '21'],
  description: 'Play blackjack',
  usage: '!blackjack [bet]',
  cooldown: 10,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const userId = message.author.id;
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0 };
    
    let bet = parseInt(args[0]) || 50;
    
    if (bet < 10) return message.reply('❌ Minimum bet is $10!');
    if (bet > userData.wallet) return message.reply('❌ You don\'t have enough money!');
    
    // Simple blackjack simulation
    const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    function drawCard() {
      return cards[Math.floor(Math.random() * cards.length)];
    }
    
    function getCardValue(card) {
      if (card === 'A') return 11;
      if (['J', 'Q', 'K'].includes(card)) return 10;
      return parseInt(card);
    }
    
    function calculateTotal(hand) {
      let total = hand.reduce((sum, card) => sum + getCardValue(card), 0);
      let aces = hand.filter(card => card === 'A').length;
      
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      
      return total;
    }
    
    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];
    
    const playerTotal = calculateTotal(playerHand);
    const dealerTotal = calculateTotal(dealerHand);
    
    let result = '';
    let winnings = 0;
    
    if (playerTotal === 21) {
      winnings = bet * 2.5; // Blackjack pays 3:2
      result = '🃏 BLACKJACK! You win!';
    } else if (playerTotal > 21) {
      result = '💥 BUST! You lose!';
    } else if (dealerTotal > 21) {
      winnings = bet * 2;
      result = '🎉 Dealer busts! You win!';
    } else if (playerTotal > dealerTotal) {
      winnings = bet * 2;
      result = '🎉 You win!';
    } else if (playerTotal === dealerTotal) {
      winnings = bet;
      result = '🤝 Push! (Tie)';
    } else {
      result = '😢 You lose!';
    }
    
    userData.wallet -= bet;
    userData.wallet += winnings;
    client.economy.set(userId, userData);
    
    const embed = {
      color: winnings > bet ? 0x00ff00 : winnings === bet ? 0xffff00 : 0xff0000,
      title: '🃏 Blackjack',
      fields: [
        { name: '👤 Your Hand', value: `${playerHand.join(' ')} = ${playerTotal}`, inline: true },
        { name: '🤖 Dealer Hand', value: `${dealerHand.join(' ')} = ${dealerTotal}`, inline: true },
        { name: '💰 Result', value: `${result}\nBet: $${bet} | Winnings: $${winnings}`, inline: false }
      ]
    };
    
    message.reply({ embeds: [embed] });
  }
};