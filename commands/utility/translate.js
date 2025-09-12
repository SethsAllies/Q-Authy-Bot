export default {
  name: 'translate',
  aliases: ['tr'],
  description: 'Translate text (simulation)',
  usage: '!translate [lang] [text]',
  cooldown: 5,
  async execute(message, args, client) {
    if (args.length < 2) {
      return message.reply('❌ Usage: `!translate [language] [text]`');
    }
    
    const targetLang = args[0].toLowerCase();
    const text = args.slice(1).join(' ');
    
    // Simulated translation responses
    const translations = {
      'spanish': 'Hola, este es un texto traducido al español.',
      'french': 'Bonjour, ceci est un texte traduit en français.',
      'german': 'Hallo, das ist ein ins Deutsche übersetzter Text.',
      'italian': 'Ciao, questo è un testo tradotto in italiano.',
      'portuguese': 'Olá, este é um texto traduzido para português.',
      'japanese': 'こんにちは、これは日本語に翻訳されたテキストです。',
      'korean': '안녕하세요, 이것은 한국어로 번역된 텍스트입니다.',
      'chinese': '你好，这是翻译成中文的文本。'
    };
    
    const translated = translations[targetLang] || `[Simulated translation to ${targetLang}]`;
    
    const embed = {
      color: 0x74b9ff,
      title: '🌐 Translation',
      fields: [
        { name: '📝 Original', value: text, inline: false },
        { name: `🔄 ${targetLang.charAt(0).toUpperCase() + targetLang.slice(1)}`, value: translated, inline: false }
      ],
      footer: { text: 'Translation service is simulated for demo purposes' }
    };
    
    message.reply({ embeds: [embed] });
  }
};