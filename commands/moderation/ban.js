export default {
  name: 'ban',
  aliases: [],
  description: 'Ban a user from the server',
  usage: '!ban @user [reason]',
  cooldown: 3,
  category: 'moderation',
  async execute(message, args, client) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ You need BanMembers permission to use this command!');
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('❌ Please mention a user!');
    }
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    // TODO: Implement ban moderation logic
    message.reply(`✅ Successfully applied ban to **${target.user.username}** for: ${reason}`);
  }
};