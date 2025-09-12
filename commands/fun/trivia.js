export default {
  name: 'trivia',
  aliases: ['quiz'],
  description: 'Start a trivia question',
  usage: '!trivia',
  cooldown: 5,
  async execute(message, args, client) {
    const questions = [
      { q: 'What is the capital of France?', a: 'paris', options: ['Paris', 'London', 'Berlin', 'Madrid'] },
      { q: 'What is 2 + 2?', a: '4', options: ['3', '4', '5', '6'] },
      { q: 'Which planet is closest to the Sun?', a: 'mercury', options: ['Venus', 'Mercury', 'Earth', 'Mars'] },
      { q: 'Who painted the Mona Lisa?', a: 'leonardo da vinci', options: ['Picasso', 'Van Gogh', 'Leonardo da Vinci', 'Michelangelo'] },
      { q: 'What is the largest ocean?', a: 'pacific', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'] }
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    const correctIndex = question.options.findIndex(opt => opt.toLowerCase().includes(question.a));
    
    const embed = {
      color: 0xf39c12,
      title: '🧠 Trivia Time!',
      description: question.q,
      fields: question.options.map((opt, i) => ({ 
        name: `${i + 1}️⃣`, 
        value: opt, 
        inline: true 
      })),
      footer: { text: 'You have 30 seconds to answer! Type the number.' }
    };
    
    const msg = await message.reply({ embeds: [embed] });
    
    // Add reaction numbers
    await msg.react('1️⃣');
    await msg.react('2️⃣');
    await msg.react('3️⃣');
    await msg.react('4️⃣');
    
    const filter = (reaction, user) => {
      return ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
    };
    
    try {
      const collected = await msg.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });
      const reaction = collected.first();
      const answerIndex = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].indexOf(reaction.emoji.name);
      
      if (answerIndex === correctIndex) {
        message.reply('✅ Correct! Great job! 🎉');
      } else {
        message.reply(`❌ Wrong! The correct answer was: **${question.options[correctIndex]}**`);
      }
    } catch {
      message.reply('⏰ Time\'s up! No answer received.');
    }
  }
};