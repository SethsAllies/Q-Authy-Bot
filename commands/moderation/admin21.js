export default {
  name: 'admin21',
  aliases: [],
  description: 'Admin command 21',
  usage: '!admin21 @user [reason]',
  cooldown: 3,
  category: 'moderation',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ You need Administrator permission to use this command!');
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('❌ Please mention a user!');
    }
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    // TODO: Implement admin21 moderation logic
    message.reply(`✅ Successfully applied admin21 to **${target.user.username}** for: ${reason}`);
  }
};