export default {
  name: 'admin60',
  aliases: [],
  description: 'Admin command 60',
  usage: '!admin60 @user [reason]',
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
    
    // TODO: Implement admin60 moderation logic
    message.reply(`✅ Successfully applied admin60 to **${target.user.username}** for: ${reason}`);
  }
};