export default {
  name: 'kick',
  aliases: ['kickuser'],
  description: 'Kick a user from the server',
  usage: '!kick @user [reason]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('KickMembers')) {
      return message.reply('❌ You need Kick Members permission to use this command!');
    }
    
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a valid member to kick!');
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    try {
      await member.kick(`${reason} | Kicked by ${message.author.tag}`);
      message.reply(`✅ Successfully kicked ${member.user.tag} for: ${reason}`);
    } catch (error) {
      message.reply('❌ Failed to kick user. Check my permissions!');
    }
  }
};