export default {
  name: 'util1',
  aliases: [],
  description: 'Utility command 1',
  usage: '!util1',
  cooldown: 3,
  category: 'utility',
  async execute(message, args, client) {
    // TODO: Implement util1 utility logic
    const embed = {
      color: 0x0099ff,
      title: '🔧 Util1',
      description: 'Utility command 1',
      timestamp: new Date(),
      footer: { text: 'Mega Discord Bot' }
    };
    
    message.reply({ embeds: [embed] });
  }
};