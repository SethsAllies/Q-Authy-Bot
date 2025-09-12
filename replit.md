# Q-Authy-Bot (Idea-to-Server Bot)

## Overview
A Discord bot that automatically creates Discord server structures (channels, categories, roles, and emojis) based on natural language descriptions. Users can describe their ideal server setup and the bot will generate and apply the structure using either OpenAI's API or a fallback keyword-based system.

## Project Status
- ✅ Successfully imported and configured for Replit environment
- ✅ Discord bot running and connected
- ✅ OpenAI API integration updated to v4
- ✅ All dependencies installed and working
- ✅ Environment secrets configured

## Recent Changes (September 12, 2025)
- Updated OpenAI API from deprecated v3 format to v4 format
- Added "type": "module" to package.json to resolve ES module warnings
- Fixed Discord.js deprecation warning by updating 'ready' event to 'clientReady'
- Configured Discord bot workflow for Replit environment
- Set up environment variables for DISCORD_TOKEN and OPENAI_API_KEY

## Project Architecture

### Core Components
- **index.js**: Main bot file containing Discord client setup and command handling
- **package.json**: Node.js project configuration with ES module support

### Key Features
- `/createserver` slash command for natural language server generation
- Fallback prefix command `!createserver` for older Discord clients
- Permission checks (requires ManageGuild or server owner)
- OpenAI integration with fallback keyword-based generation
- Supports creating categories, text/voice channels, roles, and custom emojis

### Dependencies
- discord.js v14.11.0: Discord API interaction
- openai v4.11.0: AI-powered server generation
- dotenv v16.0.0: Environment variable management
- node-fetch v3.3.0: HTTP requests for emoji fetching

### Environment Variables
- `DISCORD_TOKEN`: Required Discord bot token
- `OPENAI_API_KEY`: Optional OpenAI API key (fallback system available)
- `BOT_PREFIX`: Command prefix (default: "!")
- `GUILD_ID`: Optional guild ID for faster command registration

## Workflow Configuration
- **Discord Bot**: Runs `npm start` to start the bot
- Output type: Console (for monitoring bot logs)
- The bot automatically registers slash commands on startup

## Notes
- Global slash commands can take up to 1 hour to appear in Discord
- Bot requires ManageGuild permission or server ownership to execute commands
- Fallback system works without OpenAI API key using keyword detection
- Bot is configured as ES module for modern Node.js compatibility