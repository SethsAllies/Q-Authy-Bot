import { AutoModerationRuleTriggerType, AutoModerationActionType, AutoModerationRuleKeywordPresetType } from 'discord.js';

class AutoModService {
  constructor(client) {
    this.client = client;
    this.ruleCache = new Map(); // Guild ID -> Rules array
  }

  // AutoMod Rule Presets for Easy Setup
  static PRESETS = {
    SPAM_PROTECTION: {
      name: 'Anti-Spam Protection',
      triggerType: AutoModerationRuleTriggerType.Spam,
      actions: [
        {
          type: AutoModerationActionType.BlockMessage,
          metadata: {
            customMessage: 'Your message was blocked for spam. Please slow down!'
          }
        },
        {
          type: AutoModerationActionType.SendAlertMessage,
          metadata: {
            channelId: null // Will be set when creating
          }
        }
      ]
    },
    BAD_WORDS: {
      name: 'Bad Words Filter',
      triggerType: AutoModerationRuleTriggerType.Keyword,
      triggerMetadata: {
        presets: [
          AutoModerationRuleKeywordPresetType.Profanity,
          AutoModerationRuleKeywordPresetType.SexualContent,
          AutoModerationRuleKeywordPresetType.Slurs
        ]
      },
      actions: [
        {
          type: AutoModerationActionType.BlockMessage,
          metadata: {
            customMessage: 'Your message contained inappropriate content and was blocked.'
          }
        }
      ]
    },
    MENTION_SPAM: {
      name: 'Mention Spam Protection',
      triggerType: AutoModerationRuleTriggerType.MentionSpam,
      triggerMetadata: {
        mentionTotalLimit: 5
      },
      actions: [
        {
          type: AutoModerationActionType.BlockMessage,
          metadata: {
            customMessage: 'Too many mentions! Please reduce the number of mentions in your message.'
          }
        },
        {
          type: AutoModerationActionType.Timeout,
          metadata: {
            durationSeconds: 300 // 5 minutes
          }
        }
      ]
    },
    LINK_BLOCKER: {
      name: 'Link Blocker',
      triggerType: AutoModerationRuleTriggerType.Keyword,
      triggerMetadata: {
        keywordFilter: [
          'http://*',
          'https://*',
          'discord.gg/*',
          'discord.com/invite/*',
          'discordapp.com/invite/*'
        ]
      },
      actions: [
        {
          type: AutoModerationActionType.BlockMessage,
          metadata: {
            customMessage: 'Links are not allowed in this server!'
          }
        }
      ]
    },
    CAPS_SPAM: {
      name: 'Excessive Caps Filter',
      triggerType: AutoModerationRuleTriggerType.Keyword,
      triggerMetadata: {
        keywordFilter: ['*[A-Z]{10,}*'], // 10+ consecutive caps
        regexPatterns: ['^[A-Z\\s\\!\\?]{20,}$'] // 20+ char messages mostly caps
      },
      actions: [
        {
          type: AutoModerationActionType.BlockMessage,
          metadata: {
            customMessage: 'Please reduce the use of capital letters in your message.'
          }
        }
      ]
    }
  };

  // Create AutoMod Rule
  async createRule(guildId, ruleData) {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');

      const rule = await guild.autoModerationRules.create(ruleData);
      
      // Update cache
      if (!this.ruleCache.has(guildId)) {
        this.ruleCache.set(guildId, []);
      }
      this.ruleCache.get(guildId).push(rule);

      console.log(`✅ Created AutoMod rule: ${rule.name} in ${guild.name}`);
      return rule;
    } catch (error) {
      console.error('Failed to create AutoMod rule:', error);
      throw error;
    }
  }

  // Create Preset Rule
  async createPresetRule(guildId, presetName, options = {}) {
    const preset = AutoModService.PRESETS[presetName];
    if (!preset) throw new Error('Unknown preset');

    const ruleData = { ...preset };
    
    // Apply customizations
    if (options.logChannelId && preset.actions) {
      ruleData.actions = preset.actions.map(action => {
        if (action.type === AutoModerationActionType.SendAlertMessage) {
          return {
            ...action,
            metadata: {
              ...action.metadata,
              channelId: options.logChannelId
            }
          };
        }
        return action;
      });
    }

    // Add exempt channels/roles
    if (options.exemptChannels) ruleData.exemptChannels = options.exemptChannels;
    if (options.exemptRoles) ruleData.exemptRoles = options.exemptRoles;

    ruleData.enabled = options.enabled !== false;

    return await this.createRule(guildId, ruleData);
  }

  // Get Guild Rules
  async getGuildRules(guildId) {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');

      const rules = await guild.autoModerationRules.fetch();
      this.ruleCache.set(guildId, Array.from(rules.values()));
      
      return rules;
    } catch (error) {
      console.error('Failed to fetch AutoMod rules:', error);
      throw error;
    }
  }

  // Delete Rule
  async deleteRule(guildId, ruleId) {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');

      await guild.autoModerationRules.delete(ruleId);
      
      // Update cache
      if (this.ruleCache.has(guildId)) {
        const rules = this.ruleCache.get(guildId).filter(r => r.id !== ruleId);
        this.ruleCache.set(guildId, rules);
      }

      console.log(`✅ Deleted AutoMod rule ID: ${ruleId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete AutoMod rule:', error);
      throw error;
    }
  }

  // Setup Basic Protection Suite
  async setupBasicProtection(guildId, logChannelId = null) {
    const results = [];
    const presets = ['SPAM_PROTECTION', 'BAD_WORDS', 'MENTION_SPAM'];

    for (const preset of presets) {
      try {
        const rule = await this.createPresetRule(guildId, preset, {
          logChannelId,
          enabled: true
        });
        results.push({ preset, rule, success: true });
      } catch (error) {
        results.push({ preset, error: error.message, success: false });
      }
    }

    return results;
  }

  // Get Rule Statistics
  async getRuleStats() {
    const guilds = this.client.guilds.cache;
    let totalRules = 0;
    let guildCount = 0;

    for (const guild of guilds.values()) {
      try {
        const rules = await this.getGuildRules(guild.id);
        totalRules += rules.size;
        guildCount++;
      } catch (error) {
        console.error(`Failed to get rules for ${guild.name}:`, error);
      }
    }

    return {
      totalRules,
      guildCount,
      averageRulesPerGuild: Math.round(totalRules / Math.max(guildCount, 1)),
      badgeEligible: totalRules >= 100
    };
  }
}

export default AutoModService;