export default {
  name: 'mute',
  aliases: ['timeout'],
  description: 'Mute a user with timeout',
  usage: '!mute @user [duration] [reason]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('❌ You need Moderate Members permission to use this command!');
    }
    
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a valid member to mute!');
    
    let duration = 10 * 60 * 1000; // 10 minutes default
    let reason = 'No reason provided';
    
    if (args[1]) {
      const timeMatch = args[1].match(/^(\d+)([smhd])$/);
      if (timeMatch) {
        const value = parseInt(timeMatch[1]);
        const unit = timeMatch[2];
        switch (unit) {
          case 's': duration = value * 1000; break;
          case 'm': duration = value * 60 * 1000; break;
          case 'h': duration = value * 60 * 60 * 1000; break;
          case 'd': duration = value * 24 * 60 * 60 * 1000; break;
        }
        reason = args.slice(2).join(' ') || 'No reason provided';
      } else {
        reason = args.slice(1).join(' ');
      }
    }
    
    try {
      await member.timeout(duration, `${reason} | Muted by ${message.author.tag}`);
      const durationText = Math.floor(duration / 1000 / 60);
      message.reply(`✅ Successfully muted ${member.user.tag} for ${durationText} minutes. Reason: ${reason}`);
    } catch (error) {
      message.reply('❌ Failed to mute user. Check my permissions!');
    }
  }
};