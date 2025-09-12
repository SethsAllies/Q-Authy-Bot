export default {
  name: 'shop',
  aliases: ['store', 'buy'],
  description: 'Browse the shop or buy items',
  usage: '!shop or !shop buy [item]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const shopItems = [
      { name: 'lottery_ticket', price: 100, emoji: '🎟️', description: 'Try your luck!' },
      { name: 'energy_drink', price: 50, emoji: '⚡', description: 'Reduces work cooldown' },
      { name: 'lucky_charm', price: 500, emoji: '🍀', description: 'Increases gambling luck' },
      { name: 'fishing_rod', price: 300, emoji: '🎣', description: 'Catch fish for money' },
      { name: 'mining_pickaxe', price: 400, emoji: '⛏️', description: 'Mine gems and gold' },
      { name: 'laptop', price: 1000, emoji: '💻', description: 'Code for better work pay' }
    ];
    
    if (!args[0] || args[0] === 'list') {
      const embed = {
        color: 0x00ff00,
        title: '🏪 Shop',
        description: 'Use `!shop buy [item]` to purchase',
        fields: shopItems.map(item => ({
          name: `${item.emoji} ${item.name.replace('_', ' ')}`,
          value: `$${item.price} - ${item.description}`,
          inline: false
        }))
      };
      
      return message.reply({ embeds: [embed] });
    }
    
    if (args[0] === 'buy' && args[1]) {
      const userId = message.author.id;
      const userData = client.economy.get(userId) || { wallet: 1000, bank: 0, inventory: [] };
      
      const itemName = args[1].toLowerCase();
      const item = shopItems.find(i => i.name === itemName);
      
      if (!item) {
        return message.reply('❌ Item not found! Use `!shop` to see available items.');
      }
      
      if (userData.wallet < item.price) {
        return message.reply('❌ You don\'t have enough money!');
      }
      
      userData.wallet -= item.price;
      if (!userData.inventory) userData.inventory = [];
      userData.inventory.push(item.name);
      
      client.economy.set(userId, userData);
      
      message.reply(`✅ You bought ${item.emoji} **${item.name.replace('_', ' ')}** for $${item.price}!`);
    }
  }
};