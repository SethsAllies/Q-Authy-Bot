export default {
  name: 'qr',
  aliases: ['qrcode'],
  description: 'Generate QR code',
  usage: '!qr [text]',
  cooldown: 5,
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply('❌ Please provide text to encode!');
    }
    
    const text = args.join(' ');
    
    if (text.length > 200) {
      return message.reply('❌ Text too long! Maximum 200 characters.');
    }
    
    // Using QR Server API for QR code generation
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    
    const embed = {
      color: 0x2c3e50,
      title: '📱 QR Code Generator',
      description: `**Text:** ${text}`,
      image: { url: qrUrl },
      footer: { text: 'Scan with your phone!' }
    };
    
    message.reply({ embeds: [embed] });
  }
};