export default {
  name: 'define',
  aliases: ['definition', 'meaning'],
  description: 'Get definition of a word',
  usage: '!define [word]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('❌ Please provide a word to define!');
    }
    
    const word = args[0].toLowerCase();
    
    // Simulated definitions (would use real dictionary API)
    const definitions = {
      'awesome': 'Extremely impressive or daunting; inspiring awe.',
      'computer': 'An electronic device for storing and processing data.',
      'discord': 'A popular communication platform for communities.',
      'bot': 'A computer program that performs automated tasks.',
      'code': 'Instructions written in a programming language.',
      'javascript': 'A programming language commonly used for web development.',
      'meme': 'A humorous image, video, or text that spreads online.',
      'game': 'A form of play or sport with rules.',
      'music': 'Vocal or instrumental sounds combined in a harmonious way.',
      'friend': 'A person you know well and regard with affection.'
    };
    
    const definition = definitions[word] || `Definition not found for "${word}". This is a simulated dictionary.`;
    
    const embed = {
      color: 0x3498db,
      title: '📚 Dictionary',
      fields: [
        { name: '📝 Word', value: word.charAt(0).toUpperCase() + word.slice(1), inline: true },
        { name: '💭 Definition', value: definition, inline: false }
      ],
      footer: { text: 'Dictionary service is simulated for demo purposes' }
    };
    
    message.reply({ embeds: [embed] });
  }
};