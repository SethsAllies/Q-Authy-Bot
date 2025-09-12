export default {
  name: '8ball',
  aliases: ['eightball', 'magic8ball'],
  description: 'Ask the magic 8-ball a question',
  usage: '!8ball [question]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!args.length) return message.reply('❌ Please ask a question!');
    
    const responses = [
      '🎱 It is certain',
      '🎱 It is decidedly so',
      '🎱 Without a doubt',
      '🎱 Yes definitely',
      '🎱 You may rely on it',
      '🎱 As I see it, yes',
      '🎱 Most likely',
      '🎱 Outlook good',
      '🎱 Yes',
      '🎱 Signs point to yes',
      '🎱 Reply hazy, try again',
      '🎱 Ask again later',
      '🎱 Better not tell you now',
      '🎱 Cannot predict now',
      '🎱 Concentrate and ask again',
      "🎱 Don't count on it",
      '🎱 My reply is no',
      '🎱 My sources say no',
      '🎱 Outlook not so good',
      '🎱 Very doubtful'
    ];
    
    const question = args.join(' ');
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    message.reply(`**Question:** ${question}\n**Answer:** ${response}`);
  }
};