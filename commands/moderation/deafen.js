export default {
  name: 'deafen',
  aliases: ['deaf'],
  description: 'Deafen a user in voice chat',
  usage: '!deafen @user',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('DEAFEN_MEMBERS')) {
      return message.reply('❌ You need Deafen Members permission to use this command!');
    }
    
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Please mention a valid member to deafen!');
    }
    
    if (!member.voice.channel) {
      return message.reply('❌ User is not in a voice channel!');
    }
    
    try {
      await member.voice.setDeaf(true, `Deafened by ${message.author.tag}`);
      message.reply(`🔇 Successfully deafened **${member.user.username}**`);
    } catch (error) {
      message.reply('❌ Failed to deafen user! Check my permissions.');
    }
  }
};