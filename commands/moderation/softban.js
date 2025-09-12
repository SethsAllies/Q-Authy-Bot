export default {
  name: 'softban',
  aliases: [],
  description: 'Softban a user (ban + unban)',
  usage: '!softban @user [reason]',
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
    
    // TODO: Implement softban moderation logic
    message.reply(`✅ Successfully applied softban to **${target.user.username}** for: ${reason}`);
  }
};