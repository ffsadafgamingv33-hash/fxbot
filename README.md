# Ɗʀᴇᴀᴍ ୨୧ 卄ᴀɴɢᴏᴜᴛᴢ ✧ ˚. Discord Bot

## Overview
A feature-rich Discord bot with economy, gambling, leveling, invite tracking, crates, moderation systems, and owo-like cute features!

## Project Structure
```
├── src/
│   ├── index.js           # Main bot file
│   ├── database/
│   │   └── db.js          # SQLite database handler
│   └── commands/
│       ├── economy/       # Balance, shop, daily, etc.
│       ├── leveling/      # XP and level commands
│       ├── gambling/      # Roulette, dice, slots, etc.
│       ├── invites/       # Invite tracking
│       ├── crates/        # Crate keys and opening
│       ├── moderation/    # Warn, mute, history
│       ├── games/         # Hangman game
│       ├── admin/         # Admin commands
│       ├── utility/       # Help, avatar, wallet
│       └── verification/  # Verification commands
├── data/                  # Database storage
└── package.json
```

## Setup Requirements
1. **Discord Bot Token**: Set `DISCORD_BOT_TOKEN` as a secret
2. **Bot Permissions**: Message Content Intent must be enabled in Discord Developer Portal

## Command Prefix
All commands use the `+` prefix (e.g., `+help`, `+balance`)

## Features
### Economy System
- Credits, shop, daily rewards, inventory
- View all currencies: `+wallet` shows Credits, $, and LTC
- `+shopsetup` now supports item removal with `+shopsetup remove <id>`

### Currencies
- **Credits ⭐** - Earned from chatting and games
- **$ (Dollars)** - Owner-only distribution via `+givedollar @user <amount>`
- **Ł (LTC)** - Owner-only distribution via `+giveltc @user <amount>`

### Leveling
- Earn XP from chatting
- Level leaderboards

### Gambling
- Roulette, dice, slots, coinflip, crash games
- Gambling leaderboards and stats

### Games
- **Hangman** - `+hangman` - Win 50 credits! Interactive button-based gameplay

### Invite Tracking
- Track who invited members
- Invite statistics and leaderboards

### Crates
- Buy keys and open crates for rewards
- 3 tiers: Common, Rare, Legendary

### Moderation
- Warnings, mutes, history tracking
- Admin commands for credit/currency management

### Cute Features (Owo-like)
- `+uwu [@user]` - Send cute uwu messages
- `+avatar [@user]` - View user avatars with cute formatting

## Database
Uses SQLite (better-sqlite3) stored in `data/bot.db`
- Multiple currency support
- Complete economy tracking
- Moderation history

## Recent Changes (December 21, 2025)
- ✅ Fixed shop item removal functionality
- ✅ Added avatar display command
- ✅ Added $ and LTC currencies (owner-only)
- ✅ Added Hangman game (50 credit rewards)
- ✅ Added owo/uwu cute features
- ✅ Fixed SQL injection vulnerability in settings
- ✅ Added wallet command to view all currencies
- ✅ Updated shop setup with proper remove functionality
- ✅ Bot now running successfully with all features

## Owner Commands
- `+givedollar @user <amount>` - Give $ (Owner only)
- `+giveltc @user <amount>` - Give LTC (Owner only)
- Only owners can distribute $ and LTC - users cannot earn these

## All Commands
Use `+help` or `+help <category>` to see all available commands:
- economy, leveling, gambling, invites, crates, moderation, games, admin, utility
