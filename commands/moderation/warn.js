export default {
  name: 'warn',
  aliases: ['warning'],
  description: 'Warn a user',
  usage: '!warn @user [reason]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('❌ You need Manage Messages permission to use this command!');
    }
    
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a valid member to warn!');
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    // Simple warning system - could be enhanced with database storage
    try {
      await member.send(`⚠️ You have been warned in ${message.guild.name} for: ${reason}`);
      message.reply(`✅ Successfully warned ${member.user.tag} for: ${reason}`);
    } catch (error) {
      message.reply(`✅ Warned ${member.user.tag} for: ${reason} (Could not DM user)`);
    }
  }
};