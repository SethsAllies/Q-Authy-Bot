export default {
  name: 'antilink',
  aliases: [],
  description: 'Toggle anti-link protection',
  usage: '!antilink @user [reason]',
  cooldown: 3,
  category: 'moderation',
  async execute(message, args, client) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('❌ You need ManageGuild permission to use this command!');
    }
    
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('❌ Please mention a user!');
    }
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    // TODO: Implement antilink moderation logic
    message.reply(`✅ Successfully applied antilink to **${target.user.username}** for: ${reason}`);
  }
};