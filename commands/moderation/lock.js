export default {
  name: 'lock',
  aliases: ['lockdown'],
  description: 'Lock a channel',
  usage: '!lock [#channel]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!message.member.permissions.has('MANAGE_CHANNELS')) {
      return message.reply('❌ You need Manage Channels permission to use this command!');
    }
    
    const channel = message.mentions.channels.first() || message.channel;
    
    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });
      message.reply(`🔒 Successfully locked ${channel}`);
    } catch (error) {
      message.reply('❌ Failed to lock channel. Check my permissions!');
    }
  }
};