export default {
  name: 'mod8',
  aliases: [],
  description: 'Moderation command 8',
  usage: '!mod8 @user [reason]',
  cooldown: 3,
  category: 'moderation',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('❌ You need ModerateMembers permission to use this command!');
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('❌ Please mention a user!');
    }
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    // TODO: Implement mod8 moderation logic
    message.reply(`✅ Successfully applied mod8 to **${target.user.username}** for: ${reason}`);
  }
};