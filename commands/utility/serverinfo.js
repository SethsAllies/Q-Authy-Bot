export default {
  name: 'serverinfo',
  aliases: ['server', 'guild'],
  description: 'Get information about the server',
  usage: '!serverinfo',
  cooldown: 5,
  async execute(message, args, client) {
    const guild = message.guild;
    
    const embed = {
      color: 0x7289da,
      title: `🏰 ${guild.name}`,
      thumbnail: { url: guild.iconURL({ dynamic: true }) },
      fields: [
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '👥 Members', value: guild.memberCount.toLocaleString(), inline: true },
        { name: '📺 Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: '😀 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
        { name: '🚀 Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
        { name: '💎 Boosts', value: guild.premiumSubscriptionCount.toString(), inline: true }
      ]
    };
    
    if (guild.description) {
      embed.description = guild.description;
    }
    
    message.reply({ embeds: [embed] });
  }
};