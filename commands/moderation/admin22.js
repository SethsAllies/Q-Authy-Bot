export default {
  name: 'admin22',
  aliases: [],
  description: 'Admin command 22',
  usage: '!admin22 @user [reason]',
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
    
    // TODO: Implement admin22 moderation logic
    message.reply(`✅ Successfully applied admin22 to **${target.user.username}** for: ${reason}`);
  }
};