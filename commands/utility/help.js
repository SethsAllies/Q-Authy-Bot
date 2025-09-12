import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default {
  name: 'help',
  aliases: ['h', 'commands'],
  description: 'Display all available commands with interactive categories',
  usage: '!help [command]',
  cooldown: 3,
  async execute(message, args, client) {
    if (args[0]) {
      // Show specific command help
      const command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
      
      if (!command) {
        return message.reply('❌ That command does not exist!');
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Help: ${command.name}`)
        .addFields(
          { name: 'Description', value: command.description || 'No description', inline: false },
          { name: 'Usage', value: command.usage || `!${command.name}`, inline: false },
          { name: 'Aliases', value: command.aliases?.join(', ') || 'None', inline: false },
          { name: 'Cooldown', value: `${command.cooldown || 3} seconds`, inline: false }
        );
      
      message.reply({ embeds: [embed] });
    } else {
      // Show main help with category buttons
      const totalCommands = client.commands.size;
      
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('🤖 Mega Discord Bot - 540+ Commands!')
        .setDescription(`Welcome to the ultimate Discord bot with **${totalCommands}** commands across 6 categories!\n\n**Prefix Commands:** Use \`!\` before command names\n**Slash Commands:** Use \`/\` before command names\n\nClick the buttons below to explore commands by category!`)
        .addFields(
          { name: '🛡️ Moderation & Admin', value: 'Ban, kick, mute, warnings, automod, roles, and server management!', inline: true },
          { name: '🎮 Fun & Games', value: 'Games, memes, reactions, rates, trivia, entertainment, and social fun!', inline: true },
          { name: '💰 Economy & Levels', value: 'Work, gambling, shop, inventory, leaderboards, and financial systems!', inline: true },
          { name: '🎶 Music', value: 'Play, pause, queue, volume, playlists, effects, and audio controls!', inline: true },
          { name: '🛠️ Utility', value: 'Weather, translate, reminders, polls, converters, and productivity tools!', inline: true },
          { name: '🤖 AI & Media', value: 'ChatGPT, image generation, analysis, AI tools, and media processing!', inline: true }
        )
        .setFooter({ text: 'Click a category button to see all commands in that category!' })
        .setTimestamp();
      
      // Create category buttons
      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help_moderation')
            .setLabel('🛡️ Moderation')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('help_fun')
            .setLabel('🎮 Fun & Games')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('help_economy')
            .setLabel('💰 Economy')
            .setStyle(ButtonStyle.Primary)
        );
      
      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help_music')
            .setLabel('🎶 Music')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('help_utility')
            .setLabel('🛠️ Utility')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('help_ai')
            .setLabel('🤖 AI & Media')
            .setStyle(ButtonStyle.Primary)
        );
      
      const row3 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help_all')
            .setLabel('📝 All Commands')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('help_home')
            .setLabel('🏠 Home')
            .setStyle(ButtonStyle.Success)
        );
      
      message.reply({ embeds: [embed], components: [row1, row2, row3] });
    }
  }
};