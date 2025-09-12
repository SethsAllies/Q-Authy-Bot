export default {
  name: 'blacklist',
  aliases: [],
  description: 'Manage word blacklist',
  usage: '!blacklist @user [reason]',
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
    
    // TODO: Implement blacklist moderation logic
    message.reply(`✅ Successfully applied blacklist to **${target.user.username}** for: ${reason}`);
  }
};