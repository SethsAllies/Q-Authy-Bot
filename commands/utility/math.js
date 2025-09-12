export default {
  name: 'math',
  aliases: ['calc', 'calculate'],
  description: 'Calculate mathematical expressions',
  usage: '!math [expression]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('❌ Please provide a mathematical expression!');
    }
    
    const expression = args.join(' ');
    
    try {
      // Simple calculator (secure evaluation)
      const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
      
      if (sanitized !== expression) {
        return message.reply('❌ Invalid characters in expression! Use only numbers and +, -, *, /, (, )');
      }
      
      const result = eval(sanitized);
      
      if (typeof result !== 'number' || !isFinite(result)) {
        return message.reply('❌ Invalid mathematical expression!');
      }
      
      const embed = {
        color: 0x3498db,
        title: '🔢 Calculator',
        fields: [
          { name: '📝 Expression', value: `\`${expression}\``, inline: false },
          { name: '✅ Result', value: `\`${result}\``, inline: false }
        ]
      };
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('❌ Invalid mathematical expression!');
    }
  }
};