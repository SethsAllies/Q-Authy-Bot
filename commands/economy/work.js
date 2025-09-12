export default {
  name: 'work',
  aliases: ['job'],
  description: 'Work to earn money',
  usage: '!work [job]',
  cooldown: 60,
  async execute(message, args, client) {
    const userId = message.author.id;
    
    // Check cooldown
    const cooldownMs = await client.database.checkCooldown(userId, 'work');
    if (cooldownMs > 0) {
      const minutes = Math.floor(cooldownMs / (60 * 1000));
      return message.reply(`⏰ You need to wait ${minutes} more minutes before working again!`);
    }
    
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
    
    const balance = await client.database.getUserBalance(userId);
    await client.database.updateBalance(userId, balance.wallet + earnings, null);
    await client.database.setCooldown(userId, 'work', 60 * 60 * 1000); // 1 hour
    await client.database.addTransaction(userId, earnings, 'work', `Worked as ${job.name}`);
    
    message.reply(`💼 You worked as a **${job.name}** and earned **$${earnings}**!`);
  }
};