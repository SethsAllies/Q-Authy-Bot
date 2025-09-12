export default {
  name: 'inventory',
  aliases: ['inv', 'items', 'bag'],
  description: 'View your inventory',
  usage: '!inventory [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const target = message.mentions.users.first() || message.author;
    const userData = client.economy.get(target.id) || { wallet: 1000, bank: 0, inventory: [] };
    
    if (!userData.inventory || userData.inventory.length === 0) {
      return message.reply(`${target.id === message.author.id ? 'Your' : target.username + '\'s'} inventory is empty!`);
    }
    
    // Count items
    const itemCounts = {};
    userData.inventory.forEach(item => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });
    
    const itemEmojis = {
      'lottery_ticket': '🎟️',
      'energy_drink': '⚡',
      'lucky_charm': '🍀',
      'fishing_rod': '🎣',
      'mining_pickaxe': '⛏️',
      'laptop': '💻'
    };
    
    const inventoryText = Object.entries(itemCounts)
      .map(([item, count]) => `${itemEmojis[item] || '📦'} ${item.replace('_', ' ')} x${count}`)
      .join('\n') || 'Empty inventory';
    
    const embed = {
      color: 0x8e44ad,
      title: `🎒 ${target.username}'s Inventory`,
      description: inventoryText,
      footer: { text: `Total items: ${userData.inventory.length}` }
    };
    
    message.reply({ embeds: [embed] });
  }
};