export default {
  name: 'unmute',
  aliases: ['untimeout'],
  description: 'Remove timeout from a user',
  usage: '!unmute @user',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('❌ You need Moderate Members permission to use this command!');
    }
    
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a valid member to unmute!');
    
    try {
      await member.timeout(null, `Unmuted by ${message.author.tag}`);
      message.reply(`✅ Successfully unmuted ${member.user.tag}`);
    } catch (error) {
      message.reply('❌ Failed to unmute user. Check my permissions!');
    }
  }
};