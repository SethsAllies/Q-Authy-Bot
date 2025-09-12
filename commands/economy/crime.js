export default {
  name: 'crime',
  aliases: ['steal'],
  description: 'Commit a crime for money (risky)',
  usage: '!crime',
  cooldown: 120,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const userId = message.author.id;
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0 };
    
    const crimes = [
      { name: 'pickpocketing', minReward: 10, maxReward: 100, successRate: 0.7 },
      { name: 'shoplifting', minReward: 50, maxReward: 200, successRate: 0.6 },
      { name: 'bank robbery', minReward: 500, maxReward: 2000, successRate: 0.3 },
      { name: 'hacking', minReward: 200, maxReward: 800, successRate: 0.5 },
      { name: 'car theft', minReward: 300, maxReward: 1200, successRate: 0.4 }
    ];
    
    const crime = crimes[Math.floor(Math.random() * crimes.length)];
    const success = Math.random() < crime.successRate;
    
    if (success) {
      const reward = Math.floor(Math.random() * (crime.maxReward - crime.minReward + 1)) + crime.minReward;
      userData.wallet += reward;
      
      client.economy.set(userId, userData);
      
      message.reply(`🎯 **Crime successful!** You earned **$${reward}** from ${crime.name}!`);
    } else {
      const fine = Math.floor(userData.wallet * 0.1);
      userData.wallet -= fine;
      
      client.economy.set(userId, userData);
      
      message.reply(`🚨 **You got caught!** You were fined **$${fine}** for attempted ${crime.name}!`);
    }
  }
};