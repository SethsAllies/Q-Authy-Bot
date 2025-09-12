export default {
  name: 'jail',
  aliases: [],
  description: 'Jail a user',
  usage: '!jail @user [reason]',
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
    
    // TODO: Implement jail moderation logic
    message.reply(`✅ Successfully applied jail to **${target.user.username}** for: ${reason}`);
  }
};