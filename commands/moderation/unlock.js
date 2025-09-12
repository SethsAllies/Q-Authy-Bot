export default {
  name: 'unlock',
  aliases: ['unlockdown'],
  description: 'Unlock a channel',
  usage: '!unlock [#channel]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('MANAGE_CHANNELS')) {
      return message.reply('❌ You need Manage Channels permission to use this command!');
    }
    
    const channel = message.mentions.channels.first() || message.channel;
    
    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null
      });
      message.reply(`🔓 Successfully unlocked ${channel}`);
    } catch (error) {
      message.reply('❌ Failed to unlock channel. Check my permissions!');
    }
  }
};