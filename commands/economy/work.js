export default {
  name: 'work',
  aliases: ['job'],
  description: 'Work to earn money',
  usage: '!work [job]',
  cooldown: 60,
  async execute(message, args, client) {
    if (!client.economy) client.economy = new Map();
    
    const userId = message.author.id;
    const userData = client.economy.get(userId) || { wallet: 1000, bank: 0 };
    
    const jobs = [
      { name: 'programmer', min: 200, max: 500 },
      { name: 'teacher', min: 150, max: 300 },
      { name: 'doctor', min: 300, max: 600 },
      { name: 'janitor', min: 50, max: 150 },
      { name: 'chef', min: 100, max: 250 },
      { name: 'delivery driver', min: 80, max: 180 }
    ];
    
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
    
    userData.wallet += earnings;
    client.economy.set(userId, userData);
    
    message.reply(`💼 You worked as a **${job.name}** and earned **$${earnings}**!`);
  }
};