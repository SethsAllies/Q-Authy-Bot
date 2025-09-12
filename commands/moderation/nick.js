export default {
  name: 'nick',
  aliases: ['nickname', 'rename'],
  description: 'Change user nickname',
  usage: '!nick @user [new nick] or !nick reset @user',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('MANAGE_NICKNAMES')) {
      return message.reply('❌ You need Manage Nicknames permission to use this command!');
    }
    
    if (!args.length) {
      return message.reply('❌ Usage: `!nick @user [nickname]` or `!nick reset @user`');
    }
    
    if (args[0] === 'reset') {
      const member = message.mentions.members.first();
      if (!member) {
        return message.reply('❌ Please mention a member to reset their nickname!');
      }
      
      try {
        await member.setNickname(null, `Nickname reset by ${message.author.tag}`);
        message.reply(`✅ Reset ${member.user.username}'s nickname!`);
      } catch (error) {
        message.reply('❌ Failed to reset nickname! Check my permissions.');
      }
      return;
    }
    
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Please mention a member!');
    }
    
    const nickname = args.slice(1).join(' ');
    if (!nickname) {
      return message.reply('❌ Please provide a nickname!');
    }
    
    if (nickname.length > 32) {
      return message.reply('❌ Nickname must be 32 characters or less!');
    }
    
    try {
      await member.setNickname(nickname, `Nickname changed by ${message.author.tag}`);
      message.reply(`✅ Changed ${member.user.username}'s nickname to **${nickname}**!`);
    } catch (error) {
      message.reply('❌ Failed to change nickname! Check my permissions.');
    }
  }
};