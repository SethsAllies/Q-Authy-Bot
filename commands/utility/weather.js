export default {
  name: 'weather',
  aliases: ['w'],
  description: 'Get weather information',
  usage: '!weather [city]',
  cooldown: 5,
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('❌ Please specify a city!');
    }
    
    const city = args.join(' ');
    
    // Placeholder weather system (would need actual API)
    const weatherTypes = ['☀️ Sunny', '⛅ Partly Cloudy', '☁️ Cloudy', '🌧️ Rainy', '⛈️ Stormy', '❄️ Snowy'];
    const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const temp = Math.floor(Math.random() * 35) + 5; // 5-40°C
    const humidity = Math.floor(Math.random() * 40) + 30; // 30-70%
    
    const embed = {
      color: 0x87ceeb,
      title: `🌤️ Weather in ${city}`,
      fields: [
        { name: '🌡️ Temperature', value: `${temp}°C`, inline: true },
        { name: '🌦️ Condition', value: weather, inline: true },
        { name: '💧 Humidity', value: `${humidity}%`, inline: true }
      ],
      footer: { text: 'Weather data is simulated for demo purposes' }
    };
    
    message.reply({ embeds: [embed] });
  }
};