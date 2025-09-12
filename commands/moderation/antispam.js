export default {
  name: 'antispam',
  aliases: [],
  description: 'Toggle anti-spam protection',
  usage: '!antispam @user [reason]',
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
    
    // TODO: Implement antispam moderation logic
    message.reply(`✅ Successfully applied antispam to **${target.user.username}** for: ${reason}`);
  }
};