export default {
  name: 'time',
  aliases: ['clock', 'timezone'],
  description: 'Get current time for a city',
  usage: '!time [city]',
  cooldown: 3,
  async execute(message, args, client) {
    const city = args.join(' ') || 'UTC';
    
    // Simulated time zones
    const timezones = {
      'london': 'GMT+0',
      'paris': 'GMT+1', 
      'tokyo': 'GMT+9',
      'new york': 'GMT-5',
      'los angeles': 'GMT-8',
      'sydney': 'GMT+10',
      'moscow': 'GMT+3',
      'dubai': 'GMT+4',
      'utc': 'GMT+0'
    };
    
    const timezone = timezones[city.toLowerCase()] || 'GMT+0';
    const currentTime = new Date().toLocaleString('en-US', { 
      timeZone: 'UTC',
      hour12: true,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const embed = {
      color: 0x3498db,
      title: '🕐 World Clock',
      fields: [
        { name: '🌍 Location', value: city.charAt(0).toUpperCase() + city.slice(1), inline: true },
        { name: '⏰ Timezone', value: timezone, inline: true },
        { name: '📅 Current Time', value: currentTime, inline: false }
      ],
      footer: { text: 'Time service is simulated for demo purposes' }
    };
    
    message.reply({ embeds: [embed] });
  }
};