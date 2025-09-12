export default {
  name: 'fish',
  aliases: ['fishing'],
  description: 'Go fishing to earn money',
  usage: '!fish',
  cooldown: 60,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const userId = message.author.id;
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0, inventory: [] };
    
    // Check if user has fishing rod
    const hasFishingRod = userData.inventory && userData.inventory.includes('fishing_rod');
    
    const fishTypes = [
      { name: '🐟 Small Fish', value: 10, chance: 0.4 },
      { name: '🐠 Tropical Fish', value: 25, chance: 0.3 },
      { name: '🎣 Bass', value: 50, chance: 0.15 },
      { name: '🦈 Shark', value: 200, chance: 0.05 },
      { name: '🐙 Octopus', value: 100, chance: 0.08 },
      { name: '🦀 Crab', value: 75, chance: 0.1 }
    ];
    
    const rand = Math.random();
    let cumulativeChance = 0;
    let caughtFish = null;
    
    for (const fish of fishTypes) {
      cumulativeChance += fish.chance;
      if (rand <= cumulativeChance) {
        caughtFish = fish;
        break;
      }
    }
    
    if (!caughtFish) {
      return message.reply('🎣 You didn\'t catch anything... Better luck next time!');
    }
    
    let earnings = caughtFish.value;
    if (hasFishingRod) {
      earnings = Math.floor(earnings * 1.5); // 50% bonus with fishing rod
    }
    
    userData.wallet += earnings;
    client.economy.set(userId, userData);
    
    const bonusText = hasFishingRod ? ' (+50% with fishing rod!)' : '';
    message.reply(`🎣 You caught a ${caughtFish.name} and earned **$${earnings}**!${bonusText}`);
  }
};