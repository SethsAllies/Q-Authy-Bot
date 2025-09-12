export default {
  name: 'joke',
  aliases: ['dadjoke', 'pun'],
  description: 'Get a random joke',
  usage: '!joke',
  cooldown: 3,
  async execute(message, args, client) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
      "Why don't programmers like nature? It has too many bugs.",
      "I would avoid the sushi if I was you. It's a little fishy.",
      "Want to hear a joke about construction? I'm still working on it.",
      "What do you call a fish wearing a crown? A king fish!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "What do you call a bear with no teeth? A gummy bear!"
    ];
    
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    message.reply(`😂 ${joke}`);
  }
};