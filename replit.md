# RDX Bot - Replit Agent Guide

## Overview

RDX Bot is a Facebook Messenger automation bot built with Node.js. It uses a custom Facebook Chat API (`isardar-fca` / `RDX-FCA`) to interact with Facebook Messenger, providing group management, economy system, Islamic content posting, food image commands, and various utility features. The bot is primarily designed for Urdu/Pakistani users and operates through Facebook Messenger group chats.

The bot runs through a process supervisor (`index.js`) that spawns the main bot script (`RDX.js`) and auto-restarts it on crashes, with rate limiting to prevent restart loops.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Entry Point & Process Management
- **`index.js`** - Top-level process supervisor. Spawns `RDX.js` as a child process and handles auto-restart on crashes with configurable delay and fast-restart window protection.
- **`RDX.js`** - Main bot script. Handles Facebook login via appstate cookies, loads commands/events, sets up cron jobs for scheduled tasks (Islamic posts, auto-restart), and starts the message listener.

### Facebook Chat API (RDX-FCA)
- **`RDX-FCA/`** - Local npm package (referenced as `file:./RDX-FCA` in package.json). This is a custom fork of Facebook Chat API (fca) that handles:
  - Cookie-based Facebook authentication (no official API)
  - MQTT-based real-time message listening
  - Token refresh (`fb_dtsg`) management
  - Message sending, user info retrieval, group management
- **`appstate.json`** - Facebook session cookies used for authentication
- **`RDX-FCA.json`** - Stores `fb_dtsg` tokens and `jazoest` values for multiple Facebook accounts

### Command System
- **`RDX/commands/`** - All bot commands as individual `.js` modules. Each exports a `config` object (name, aliases, category, permissions) and a `run` function.
- **`RDX/events/`** - Event handlers for group events (join, leave, etc.)
- Commands are loaded dynamically by `Data/system/handle/handleRefresh.js`
- Command routing happens in `Data/system/handle/handleCommand.js`

### Command Categories
- **Admin**: restart, admin management, approve groups, adminonly mode, autoban
- **Group**: add/kick users, antijoin, antiout, tag all members
- **Economy**: balance, bank system with SQLite (better-sqlite3)
- **Fun**: 20+ food image commands (biryani, pizza, etc.), stickers
- **Media**: avatar/profile pic fetcher
- **Utility**: user info, ban/unban, block
- **Friend**: accept friend requests
- **Profile**: bio changes

### Data Layer
- **`Data/system/database/`** - SQLite database via `better-sqlite3` for persistent storage
- **`Data/system/controllers/`** - Three main controllers:
  - `users.js` - User data, banning, name resolution
  - `threads.js` - Group/thread settings (antijoin, antiout, approval, per-group config)
  - `currencies.js` - Economy system (wallet balance, bank balance, transactions)
- **`Data/utility/`** - Helper modules:
  - `logs.js` - Colored console logging with file-based log persistence (daily log files)
  - `send.js` - Message sending wrapper with retry logic and membership checks
  - `utils.js` - Time formatting, random helpers, UID validation

### Message Processing Pipeline
1. `RDX.js` establishes Facebook connection via `RDX-FCA`
2. `Data/system/listen.js` receives all events
3. Events are routed to appropriate handlers:
   - `handleCommand` - Prefix-based command execution
   - `handleEvent` - Group events (member join/leave)
   - `handleReaction` - Emoji reactions
   - `handleReply` - Reply-based interactions
   - `handleNotification` - Facebook notifications
   - `handleCreateDatabase` - Auto-creates user/thread DB entries
   - `handleAutoDetect` - Auto-detection features

### Configuration
- **`config.json`** - Main bot config: bot name, prefix (`.`), admin UIDs, cooldowns, feature toggles
- **`Data/config/islamic_messages.json`** - Islamic messages for scheduled posting
- **`Data/system/autosen.json`** - Auto-seen toggle state
- Per-command cache data stored in `RDX/commands/cache/data/`

### Key Design Patterns
- **Module-per-command**: Each command is a self-contained file with config + run function
- **Client map pattern**: `client.commands`, `client.events`, `client.replies`, `client.cooldowns` Maps for runtime state
- **Hot reload**: Commands can be reloaded without full restart via the `restart` command
- **Timezone**: All times use `Asia/Karachi` (Pakistan Standard Time)
- **Retry logic**: Message sending has built-in retry with exponential backoff for transient errors

### Security Notes
- `RDX-FCA/index.js` contains SHA-256 hash-based token validation (`_INTERNAL_TOKEN_BUFFER`) for authorized user IDs
- `Data/system/listen.js` has similar hash-based cache validation
- Admin commands check against `config.ADMINBOT` array

## External Dependencies

### Core Dependencies
- **`better-sqlite3`** - SQLite database for user data, economy, thread settings
- **`axios`** - HTTP client for API calls and image downloads
- **`node-cron`** - Scheduled tasks (Islamic posts, auto-restart)
- **`moment-timezone`** - Time handling in Pakistan timezone
- **`fs-extra`** - Enhanced file system operations
- **`chalk`** - Colored terminal output
- **`express`** - Web server (likely for keep-alive/health checks)

### Media Processing
- **`canvas`** - Image generation (credit cards, profile cards)
- **`jimp`** - Image manipulation (bestfriend pair edits)

### Facebook Integration
- **`RDX-FCA` (local)** - Custom Facebook Chat API using:
  - `request` - HTTP requests to Facebook
  - `cheerio` - HTML parsing for Facebook pages
  - `mqtt` / `websocket-stream` - Real-time message streaming
  - `https-proxy-agent` - Proxy support for region bypass

### Other
- **`yt-search`** - YouTube search functionality
- **`string-similarity`** - Fuzzy command matching
- **`pastebin-api`** - Pastebin integration
- **`node-fetch`** - Additional HTTP fetching
- **`gradient-string`** - Terminal gradient text effects

### External APIs Used
- **Facebook Graph API** - Profile pictures (`graph.facebook.com`)
- **ibb.co** - Image hosting (food images, templates)
- **Tenor API** - GIF/sticker fetching for bot reactions
- **Facebook internal APIs** - Friend requests, bio changes, group management (via RDX-FCA)

### No Traditional Database Server
The project uses SQLite (file-based) via `better-sqlite3`. There is no PostgreSQL, MySQL, or other external database server. If a database server is needed later, migration from SQLite would be required.