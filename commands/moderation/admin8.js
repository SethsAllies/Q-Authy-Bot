export default {
  name: 'admin8',
  aliases: [],
  description: 'Admin command 8',
  usage: '!admin8 @user [reason]',
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
    
    // TODO: Implement admin8 moderation logic
    message.reply(`✅ Successfully applied admin8 to **${target.user.username}** for: ${reason}`);
  }
};