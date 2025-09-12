export default {
  name: 'slowmode',
  aliases: ['slow'],
  description: 'Set channel slowmode',
  usage: '!slowmode [seconds] or !slowmode off',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('MANAGE_CHANNELS')) {
      return message.reply('❌ You need Manage Channels permission to use this command!');
    }
    
    if (!args[0]) {
      return message.reply('❌ Please specify slowmode duration in seconds or "off"!');
    }
    
    const channel = message.channel;
    
    if (args[0].toLowerCase() === 'off') {
      try {
        await channel.setRateLimitPerUser(0);
        message.reply('✅ Slowmode disabled!');
      } catch (error) {
        message.reply('❌ Failed to disable slowmode!');
      }
      return;
    }
    
    const seconds = parseInt(args[0]);
    
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply('❌ Please provide a valid number between 0 and 21600 seconds!');
    }
    
    try {
      await channel.setRateLimitPerUser(seconds);
      message.reply(`⏰ Slowmode set to ${seconds} seconds!`);
    } catch (error) {
      message.reply('❌ Failed to set slowmode!');
    }
  }
};