export default {
  name: 'poll',
  aliases: ['vote'],
  description: 'Create a poll',
  usage: '!poll [question] | [option1] | [option2] | [option3]...',
  cooldown: 5,
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('❌ Usage: `!poll Question? | Option 1 | Option 2 | Option 3`');
    }
    
    const content = args.join(' ');
    const parts = content.split(' | ');
    
    if (parts.length < 3) {
      return message.reply('❌ Please provide a question and at least 2 options separated by ` | `');
    }
    
    const question = parts[0];
    const options = parts.slice(1);
    
    if (options.length > 10) {
      return message.reply('❌ Maximum 10 poll options allowed!');
    }
    
    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    
    const embed = {
      color: 0x3498db,
      title: '📊 Poll',
      description: `**${question}**\n\n${options.map((opt, i) => `${numberEmojis[i]} ${opt}`).join('\n')}`,
      footer: { text: `Poll created by ${message.author.username}` }
    };
    
    const pollMessage = await message.reply({ embeds: [embed] });
    
    // Add reactions
    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(numberEmojis[i]);
    }
  }
};