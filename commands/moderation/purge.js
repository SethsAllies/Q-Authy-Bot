export default {
  name: 'purge',
  aliases: ['clear', 'clean'],
  description: 'Delete multiple messages',
  usage: '!purge [amount]',
  cooldown: 5,
  async execute(message, args, client) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('❌ You need Manage Messages permission to use this command!');
    }
    
    const amount = parseInt(args[0]);
    
    if (!amount || amount < 1 || amount > 100) {
      return message.reply('❌ Please provide a number between 1 and 100!');
    }
    
    try {
      const deleted = await message.channel.bulkDelete(amount + 1, true);
      const confirmation = await message.channel.send(`✅ Successfully deleted ${deleted.size - 1} messages!`);
      
      setTimeout(() => {
        confirmation.delete().catch(() => {});
      }, 5000);
    } catch (error) {
      message.reply('❌ Failed to delete messages! Messages might be too old (14+ days).');
    }
  }
};