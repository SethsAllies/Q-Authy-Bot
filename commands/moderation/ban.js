export default {
  name: 'ban',
  aliases: ['banuser'],
  description: 'Ban a user from the server',
  usage: '!ban @user [reason]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ You need Ban Members permission to use this command!');
    }
    
    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) return message.reply('❌ Please mention a valid user to ban!');
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    try {
      await message.guild.members.ban(user, { reason: `${reason} | Banned by ${message.author.tag}` });
      message.reply(`✅ Successfully banned ${user.tag} for: ${reason}`);
    } catch (error) {
      message.reply('❌ Failed to ban user. Check my permissions!');
    }
  }
};