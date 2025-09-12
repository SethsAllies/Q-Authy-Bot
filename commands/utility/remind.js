export default {
  name: 'remind',
  aliases: ['remindme', 'reminder'],
  description: 'Set a reminder',
  usage: '!remind [time] [message]',
  cooldown: 3,
  async execute(message, args, client) {
    if (args.length < 2) {
      return message.reply('❌ Usage: `!remind [time] [message]` (e.g., !remind 5m Take a break)');
    }
    
    const timeString = args[0];
    const reminderText = args.slice(1).join(' ');
    
    const timeMatch = timeString.match(/^(\d+)([smhd])$/);
    if (!timeMatch) {
      return message.reply('❌ Invalid time format! Use: 30s, 5m, 2h, 1d');
    }
    
    const value = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    
    let milliseconds;
    switch (unit) {
      case 's': milliseconds = value * 1000; break;
      case 'm': milliseconds = value * 60 * 1000; break;
      case 'h': milliseconds = value * 60 * 60 * 1000; break;
      case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
    }
    
    if (milliseconds > 24 * 60 * 60 * 1000) {
      return message.reply('❌ Maximum reminder time is 24 hours!');
    }
    
    message.reply(`⏰ Reminder set! I'll remind you in ${timeString} about: ${reminderText}`);
    
    setTimeout(() => {
      message.author.send(`⏰ **Reminder:** ${reminderText}`).catch(() => {
        message.channel.send(`⏰ <@${message.author.id}> **Reminder:** ${reminderText}`);
      });
    }, milliseconds);
  }
};