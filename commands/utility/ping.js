export default {
  name: 'ping',
  aliases: ['latency'],
  description: 'Shows bot latency and response time',
  usage: '!ping',
  cooldown: 3,
  async execute(message, args, client) {
    const sent = await message.reply('🏓 Pinging...');
    const timeDiff = sent.createdTimestamp - message.createdTimestamp;
    
    const embed = {
      color: timeDiff > 200 ? 0xff0000 : timeDiff > 100 ? 0xffff00 : 0x00ff00,
      title: '🏓 Pong!',
      fields: [
        { name: '📡 Bot Latency', value: `${timeDiff}ms`, inline: true },
        { name: '💓 API Latency', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: '📊 Status', value: timeDiff > 200 ? '🔴 Slow' : timeDiff > 100 ? '🟡 Average' : '🟢 Fast', inline: true }
      ],
      timestamp: new Date()
    };
    
    sent.edit({ content: '', embeds: [embed] });
  }
};