export default {
  name: 'userinfo',
  aliases: ['user', 'whois'],
  description: 'Get information about a user',
  usage: '!userinfo [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
    
    const embed = {
      color: 0x0099ff,
      title: `👤 User Information`,
      thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
      fields: [
        { name: '📛 Username', value: user.tag, inline: true },
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
      ]
    };
    
    if (member) {
      embed.fields.push(
        { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
        { name: '🎭 Roles', value: member.roles.cache.map(r => r.toString()).slice(0, 10).join(' ') || 'None', inline: false }
      );
    }
    
    message.reply({ embeds: [embed] });
  }
};