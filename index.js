/**
 * Idea→Server Bot
 * - discord.js v14
 * - sends idea to OpenAI to receive a JSON blueprint
 * - creates categories, channels, roles, and emojis
 *
 * NOTE: set DISCORD_TOKEN and (optionally) OPENAI_API_KEY in .env
 */

import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, PermissionsBitField, REST, Routes, SlashCommandBuilder, ChannelType } from 'discord.js';
import OpenAI from 'openai';
import fetch from 'node-fetch';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;
const BOT_PREFIX = process.env.BOT_PREFIX || '!';
const GUILD_ID = process.env.GUILD_ID || null;

if (!DISCORD_TOKEN) {
  console.error('Please set DISCORD_TOKEN in .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

let openai = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

/**
 * Register a single slash command: /createserver prompt:
 */
async function registerSlash() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const cmd = new SlashCommandBuilder()
    .setName('createserver')
    .setDescription('Create channels/roles/emojis from an idea')
    .addStringOption(opt => opt.setName('idea').setDescription('Describe the server you want').setRequired(true));
  try {
    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: [cmd.toJSON()] });
      console.log('Registered guild command');
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body: [cmd.toJSON()] });
      console.log('Registered global command (can take up to 1 hour to appear)');
    }
  } catch (err) {
    console.error('Failed to register slash command', err);
  }
}

/**
 * Convert natural text idea into a JSON blueprint via OpenAI or fallback parser
 * Expected JSON schema:
 * {
 *   "categories": [
 *     {
 *       "name": "General",
 *       "channels": [
 *         { "name": "general", "type": "text", "topic": "General chat" },
 *         { "name": "voice-1", "type": "voice" }
 *       ]
 *     }
 *   ],
 *   "roles": [
 *     { "name": "Admin", "permissions": ["Administrator"] },
 *     { "name": "Member", "permissions": [] }
 *   ],
 *   "emojis": [
 *     { "name": "pog", "url": "https://example.com/pog.png" }
 *   ]
 * }
 */
async function ideaToBlueprint(idea) {
  // If OPENAI_API_KEY available, use it.
  if (openai) {
    const prompt = `
You are a helpful assistant that converts a short natural-language description about a Discord server into a strict JSON blueprint.
Accept one idea string and output only JSON (no explanation). The JSON must follow this format:

{
  "categories": [
    {
      "name": "Category name",
      "channels": [
        { "name": "channel-name", "type": "text" | "voice", "topic": "optional text", "nsfw": false }
      ]
    }
  ],
  "roles": [
    { "name": "RoleName", "permissions": ["ManageChannels","KickMembers"] }
  ],
  "emojis": [
    { "name": "emojiname", "url": "https://...", "require_animated": false }
  ]
}

Create a reasonable server blueprint from the following idea: "${idea}"
Make categories and 4-12 channels total typically. Use short kebab-case channel names. Keep JSON strictly valid.
    `;
    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 800,
      });
      // find assistant text
      const text = res?.choices?.[0]?.message?.content;
      // Try to extract JSON substring
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      const jsonText = start >= 0 && end >= 0 ? text.substring(start, end + 1) : text;
      const parsed = JSON.parse(jsonText);
      return parsed;
    } catch (err) {
      console.error('OpenAI error', err?.response?.data || err);
      // fallback to naive parser below
    }
  }

  // Fallback simple heuristic parser (no AI):
  // Look for keywords and build a simple structure.
  const lower = idea.toLowerCase();
  const blueprint = { categories: [], roles: [], emojis: [] };

  // roles
  blueprint.roles.push({ name: 'Admin', permissions: ['Administrator'] });
  blueprint.roles.push({ name: 'Moderator', permissions: ['ManageChannels', 'KickMembers'] });
  blueprint.roles.push({ name: 'Member', permissions: [] });

  // categories & channels
  blueprint.categories.push({
    name: 'General',
    channels: [
      { name: 'welcome', type: 'text', topic: 'Welcome & rules' },
      { name: 'general', type: 'text', topic: 'General chat' },
    ]
  });

  if (lower.includes('gaming') || lower.includes('tournaments')) {
    blueprint.categories.push({
      name: 'Gaming',
      channels: [
        { name: 'matchmaking', type: 'text', topic: 'Find people to play with' },
        { name: 'tournaments', type: 'text', topic: 'Tournament announcements' },
        { name: 'voice-lobby', type: 'voice' }
      ]
    });
  }

  if (lower.includes('memes') || lower.includes('meme')) {
    blueprint.categories.push({
      name: 'Memes',
      channels: [ { name: 'memes', type: 'text', topic: 'Post memes!' } ]
    });
  }

  if (lower.includes('study') || lower.includes('homework')) {
    blueprint.categories.push({
      name: 'Study',
      channels: [
        { name: 'study-hall', type: 'text', topic: 'Study with others' },
        { name: 'resources', type: 'text' }
      ]
    });
  }

  // emojis heuristic
  if (lower.includes('gaming')) {
    blueprint.emojis.push({ name: 'gg', url: 'https://i.imgur.com/5bXHq8z.png' });
  }

  return blueprint;
}

/**
 * Create roles, categories, channels and emojis given a blueprint and a guild
 */
async function applyBlueprint(guild, blueprint, createdBy) {
  const created = { roles: [], categories: [], channels: [], emojis: [] };

  // Create roles
  if (Array.isArray(blueprint.roles)) {
    for (const r of blueprint.roles.slice(0, 20)) {
      try {
        // skip existing role by name
        let role = guild.roles.cache.find(x => x.name === r.name);
        if (!role) {
          role = await guild.roles.create({
            name: r.name,
            reason: `Created by idea-to-server (${createdBy?.tag || 'bot'})`,
            permissions: r.permissions ? r.permissions.map(p => PermissionsBitField.Flags[p]) .filter(Boolean) : [],
          });
        }
        created.roles.push(role);
      } catch (err) {
        console.warn('Failed to create role', r.name, err?.message || err);
      }
    }
  }

  // Create categories and channels
  if (Array.isArray(blueprint.categories)) {
    for (const cat of blueprint.categories.slice(0, 25)) {
      try {
        const category = await guild.channels.create({
          name: cat.name,
          type: ChannelType.GuildCategory,
          reason: `Category from idea by ${createdBy?.tag || 'bot'}`,
        });
        created.categories.push(category);

        if (Array.isArray(cat.channels)) {
          for (const ch of cat.channels.slice(0, 30)) {
            try {
              const opts = {
                name: ch.name,
                type: ch.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
                topic: ch.topic || undefined,
                parent: category,
                reason: `Channel from idea by ${createdBy?.tag || 'bot'}`,
              };
              const newCh = await guild.channels.create(opts);
              created.channels.push(newCh);
            } catch (err) {
              console.warn('Failed to create channel', ch.name, err?.message || err);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to create category', cat.name, err?.message || err);
      }
    }
  }

  // Upload emojis if present
  if (Array.isArray(blueprint.emojis)) {
    for (const e of blueprint.emojis.slice(0, 20)) {
      try {
        // fetch image bytes
        if (!e.url) continue;
        const resp = await fetch(e.url);
        if (!resp.ok) throw new Error(`emoji fetch failed ${resp.status}`);
        const buffer = await resp.arrayBuffer();
        // create emoji
        const emoji = await guild.emojis.create({
          name: e.name.replace(/\s+/g, '_').toLowerCase(),
          attachment: Buffer.from(buffer),
        }, `Created from idea by ${createdBy?.tag || 'bot'}`);
        created.emojis.push(emoji);
      } catch (err) {
        console.warn('Failed to create emoji', e.name, err?.message || err);
      }
    }
  }

  return created;
}

/**
 * Safety: check the invoking user has ManageGuild or is guild owner
 */
function hasManageGuildPermission(member) {
  if (!member) return false;
  return member.permissions.has(PermissionsBitField.Flags.ManageGuild) || member.id === member.guild.ownerId;
}

/**
 * Command handling
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'createserver') {
    const idea = interaction.options.getString('idea', true);
    await interaction.reply({ content: `Processing your idea...`, ephemeral: true });

    // permission check
    const member = interaction.member;
    if (!hasManageGuildPermission(member)) {
      await interaction.editReply({ content: 'You must have Manage Server permission to run this.' });
      return;
    }

    // Build blueprint
    let blueprint;
    try {
      blueprint = await ideaToBlueprint(idea);
    } catch (err) {
      console.error('Blueprint generation failed', err);
      await interaction.editReply({ content: 'Failed to generate blueprint.' });
      return;
    }

    // quick preview to the user (ephemeral)
    await interaction.followUp({
      content: `Blueprint generated — creating resources now. If anything goes wrong, check bot permissions.\n\`\`\`json\n${JSON.stringify(blueprint, null, 2).slice(0, 1500)}\n\`\`\``,
      ephemeral: true,
    });

    // Apply blueprint
    try {
      const created = await applyBlueprint(interaction.guild, blueprint, interaction.user);
      await interaction.followUp({
        content: `Finished creating server parts.\nRoles: ${created.roles.length}, Categories: ${created.categories.length}, Channels: ${created.channels.length}, Emojis: ${created.emojis.length}`,
        ephemeral: false,
      });
    } catch (err) {
      console.error('applyBlueprint error', err);
      await interaction.followUp({ content: 'An error occurred while applying the blueprint. Check bot logs and permissions.' });
    }
  }
});

/**
 * Basic prefix fallback for older clients
 */
client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(BOT_PREFIX)) return;
  const [cmd, ...rest] = msg.content.slice(BOT_PREFIX.length).trim().split(/\s+/);
  if (cmd === 'createserver') {
    const idea = rest.join(' ').trim();
    if (!idea) {
      msg.reply('Usage: !createserver Describe your server idea.');
      return;
    }
    if (!hasManageGuildPermission(msg.member)) {
      msg.reply('You need Manage Server permission to use this.');
      return;
    }
    const reply = await msg.reply('Processing your idea...');
    try {
      const blueprint = await ideaToBlueprint(idea);
      await reply.edit(`Blueprint:\n\`\`\`json\n${JSON.stringify(blueprint, null, 2).slice(0,1500)}\n\`\`\`\nApplying now...`);
      const created = await applyBlueprint(msg.guild, blueprint, msg.author);
      await reply.edit(`Done. Created Roles: ${created.roles.length}, Channels: ${created.channels.length}, Emojis: ${created.emojis.length}`);
    } catch (err) {
      console.error(err);
      reply.edit('Failed to create server from idea.');
    }
  }
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await registerSlash();
});

client.login(DISCORD_TOKEN);