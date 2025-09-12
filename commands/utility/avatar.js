export default {
  name: 'avatar',
  aliases: ['pfp', 'av'],
  description: 'Get user avatar',
  usage: '!avatar [@user]',
  cooldown: 3,
  async execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;
    
    const embed = {
      color: 0x7289da,
      title: `🖼️ ${user.username}'s Avatar`,
      image: { url: user.displayAvatarURL({ dynamic: true, size: 512 }) },
      description: `[Download Link](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`
    };
    
    message.reply({ embeds: [embed] });
  }
};