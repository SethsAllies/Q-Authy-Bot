import OpenAI from 'openai';

export default {
  name: 'ai',
  aliases: ['ask', 'chatgpt'],
  description: 'Ask AI a question',
  usage: '!ai [question]',
  cooldown: 10,
  async execute(message, args, client) {
    if (!client.config.openaiKey) {
      return message.reply('❌ AI functionality is not configured!');
    }
    
    if (!args.length) {
      return message.reply('❌ Please ask a question!');
    }
    
    const question = args.join(' ');
    
    try {
      const openai = new OpenAI({ apiKey: client.config.openaiKey });
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
        max_tokens: 500,
        temperature: 0.7
      });
      
      const answer = response.choices[0].message.content;
      
      const embed = {
        color: 0x00ff41,
        title: '🤖 AI Response',
        fields: [
          { name: '❓ Question', value: question, inline: false },
          { name: '💭 Answer', value: answer.slice(0, 1000), inline: false }
        ],
        footer: { text: 'Powered by OpenAI' }
      };
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('AI Error:', error);
      message.reply('❌ Sorry, I encountered an error processing your request!');
    }
  }
};