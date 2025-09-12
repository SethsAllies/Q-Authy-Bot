export default {
  name: 'rps',
  aliases: ['rockpaperscissors'],
  description: 'Play rock paper scissors',
  usage: '!rps [rock/paper/scissors]',
  cooldown: 3,
  async execute(message, args, client) {
    if (!args[0]) {
      return message.reply('❌ Please choose: rock, paper, or scissors!');
    }
    
    const choices = ['rock', 'paper', 'scissors'];
    const userChoice = args[0].toLowerCase();
    
    if (!choices.includes(userChoice)) {
      return message.reply('❌ Invalid choice! Use rock, paper, or scissors!');
    }
    
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    
    let result;
    if (userChoice === botChoice) {
      result = "It's a tie!";
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'You win! 🎉';
    } else {
      result = 'You lose! 😢';
    }
    
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    
    message.reply(`${emojis[userChoice]} vs ${emojis[botChoice]}\n**${result}**`);
  }
};