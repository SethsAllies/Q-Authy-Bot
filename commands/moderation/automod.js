import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'automod',
  aliases: ['am'],
  description: 'Manage Discord AutoMod rules and settings',
  usage: '!automod <setup|list|stats|delete> [options]',
  cooldown: 5,
  category: 'moderation',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ You need **Manage Server** permission to use this command!');
    }

    const subcommand = args[0]?.toLowerCase();
    
    if (!subcommand) {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('🛡️ AutoMod Management')
        .setDescription('Discord\'s native AutoMod system for advanced moderation')
        .addFields(
          { name: '🔧 Setup', value: '`!automod setup` - Quick setup with basic protection', inline: true },
          { name: '📋 List', value: '`!automod list` - View all active rules', inline: true },
          { name: '📊 Stats', value: '`!automod stats` - View AutoMod statistics', inline: true },
          { name: '🗑️ Delete', value: '`!automod delete <id>` - Delete a rule', inline: true },
          { name: '⚡ Presets', value: 'Spam, Bad Words, Mention Spam, Links, Caps', inline: true },
          { name: '🏆 Badge', value: 'Bots with 100+ rules get AutoMod badge!', inline: true }
        )
        .setFooter({ text: 'ProBot-style AutoMod integration • Uses Discord native API' });
      
      return message.reply({ embeds: [embed] });
    }

    const automod = client.automod;

    try {
      switch (subcommand) {
        case 'setup':
          await handleSetup(message, args, automod);
          break;
        case 'list':
          await handleList(message, automod);
          break;
        case 'stats':
          await handleStats(message, automod);
          break;
        case 'delete':
          await handleDelete(message, args, automod);
          break;
        default:
          message.reply('❌ Unknown subcommand. Use `!automod` for help.');
      }
    } catch (error) {
      console.error('AutoMod command error:', error);
      message.reply('❌ An error occurred while managing AutoMod rules.');
    }
  }
};

async function handleSetup(message, args, automod) {
  const logChannel = message.mentions.channels.first();
  
  const embed = new EmbedBuilder()
    .setColor(0xffaa00)
    .setTitle('🔄 Setting up AutoMod Protection...')
    .setDescription('Creating basic protection rules (Spam, Bad Words, Mentions)');
  
  const msg = await message.reply({ embeds: [embed] });
  
  try {
    const results = await automod.setupBasicProtection(
      message.guild.id,
      logChannel?.id
    );
    
    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    const resultEmbed = new EmbedBuilder()
      .setColor(success > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('✅ AutoMod Setup Complete!')
      .setDescription(`Successfully created **${success}** AutoMod rules${failed > 0 ? ` (${failed} failed)` : ''}`)
      .addFields(
        { name: '🛡️ Active Protection', value: results.filter(r => r.success).map(r => r.preset.replace('_', ' ')).join('\n') || 'None', inline: true },
        { name: '📊 Rule Count', value: `${success} rules created`, inline: true },
        { name: '🏆 Badge Progress', value: 'Use `!automod stats` to check badge eligibility', inline: true }
      );

    if (logChannel) {
      resultEmbed.addFields({ name: '📝 Log Channel', value: logChannel.toString(), inline: true });
    }
    
    await msg.edit({ embeds: [resultEmbed] });
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Setup Failed')
      .setDescription('Failed to create AutoMod rules. Check bot permissions.');
    
    await msg.edit({ embeds: [errorEmbed] });
  }
}

async function handleList(message, automod) {
  try {
    const rules = await automod.getGuildRules(message.guild.id);
    
    if (rules.size === 0) {
      return message.reply('📋 No AutoMod rules found. Use `!automod setup` to get started!');
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`🛡️ AutoMod Rules (${rules.size})`);
    
    const ruleList = Array.from(rules.values())
      .map(rule => `${rule.enabled ? '🟢' : '🔴'} **${rule.name}** \`(ID: ${rule.id})\``)
      .join('\n');
    
    embed.setDescription(ruleList || 'No rules found');
    embed.setFooter({ text: `${rules.size} total rules • Use !automod delete <id> to remove` });
    
    message.reply({ embeds: [embed] });
  } catch (error) {
    message.reply('❌ Failed to fetch AutoMod rules.');
  }
}

async function handleStats(message, automod) {
  try {
    const stats = await automod.getRuleStats();
    
    const embed = new EmbedBuilder()
      .setColor(stats.badgeEligible ? 0x00ff00 : 0xffaa00)
      .setTitle('📊 AutoMod Statistics')
      .addFields(
        { name: '🛡️ Total Rules', value: stats.totalRules.toString(), inline: true },
        { name: '🏠 Servers', value: stats.guildCount.toString(), inline: true },
        { name: '📈 Average/Server', value: stats.averageRulesPerGuild.toString(), inline: true },
        { 
          name: '🏆 Badge Status', 
          value: stats.badgeEligible 
            ? '✅ **Eligible for AutoMod Badge!**' 
            : `❌ Need ${100 - stats.totalRules} more rules`, 
          inline: false 
        }
      )
      .setFooter({ text: 'Discord awards AutoMod badges to bots with 100+ rules across all servers' });
    
    message.reply({ embeds: [embed] });
  } catch (error) {
    message.reply('❌ Failed to fetch AutoMod statistics.');
  }
}

async function handleDelete(message, args, automod) {
  const ruleId = args[1];
  if (!ruleId) {
    return message.reply('❌ Please provide a rule ID. Use `!automod list` to see rule IDs.');
  }
  
  try {
    await automod.deleteRule(message.guild.id, ruleId);
    message.reply(`✅ Successfully deleted AutoMod rule ID: \`${ruleId}\``);
  } catch (error) {
    message.reply('❌ Failed to delete rule. Check the rule ID is correct.');
  }
}