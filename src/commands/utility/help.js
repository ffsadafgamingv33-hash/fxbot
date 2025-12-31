const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  aliases: ['commands', 'h'],
  description: 'View all commands',
  async execute(message, args, client) {
    const categories = {
      economy: {
        emoji: '🛒',
        name: 'Shop & Credits',
        commands: [
          '+shop - View official shop link',
          '+buy <item_id> - Purchase items',
          '+balance - Check your credits',
          '+balancetop - View credit leaderboard',
          '+inventory - View purchase history',
          '+daily - Claim daily credits',
          '+wallet - View all currencies',
          '+tip <ltc/$> @user <amount> - Send credits or currencies',
          '+deposit <ltc/$/fire> <credits> - Convert credits to currency',
          '+withdraw <ltc/$> <amount> - Convert currency to credits',
          '+futureshop - Reserve credits for future purchases'
        ]
      },
      utility: {
        emoji: '❓',
        name: 'Utility',
        commands: [
          '+drop <count> <prize> - Create a drop for users to claim',
          '+gwy <winners> <time> <prize_name> <prize> - Start a giveaway',
          '+avatar [@user] - View user avatar',
          '+help - Show this help menu'
        ]
      },
      leveling: {
        emoji: '📊',
        name: 'Stats & Progress',
        commands: [
          '+level - Check your XP level',
          '+level_leaderboard - XP leaderboard',
          '+chattop - View chat leaderboard',
          '+vctop - View VC leaderboard',
          'Earn XP & credits by chatting!'
        ]
      },
      gambling: {
        emoji: '🎰',
        name: 'Gambling',
        commands: [
          '+gamblehelp - Gambling guide',
          '+roulette <amount> <color> - Play roulette',
          '+dice <amount> - Roll dice',
          '+slots <amount> - Play slots (Animated!)',
          '+coinflip <amount> <h/t> - Flip a coin (Animated!)',
          '+crash <amount> - Crash game',
          '+gamblestats - Your gambling stats',
          '+gambletop - Gambling leaderboard'
        ]
      },
      invites: {
        emoji: '📨',
        name: 'Invite Tracking',
        commands: [
          '+invites - Your invite stats',
          '+invited - Members you invited',
          '+inviteinfo <code> - Info on invite code'
        ]
      },
      crates: {
        emoji: '📦',
        name: 'Crates',
        commands: [
          '+crateinfo - View all crate information',
          '+mykeys - View your crate keys',
          '+buycratekey <type> - Buy a crate key',
          '+opencrate <type> - Open a crate'
        ]
      },
      moderation: {
        emoji: '⚙️',
        name: 'Moderation',
        commands: [
          '+warn <user> <reason> - Warn a user',
          '+unwarn <user> - Remove last warn',
          '+history <user> - Show moderation history',
          '+clearhistory <user> - Wipe history (Admin)',
          '+mute <user> <time> <reason> - Mute a user'
        ]
      },
      games: {
        emoji: '🎮',
        name: 'Games',
        commands: [
          '+hangman - Play Hangman game',
          '+mine - Mine for credits and resources',
          '+uwu [@user] - Uwu someone!'
        ]
      },
      admin: {
        emoji: '🔧',
        name: 'Admin',
        commands: [
          '+adminadd <@user> - Add bot admin (Owner)',
          '+clb <CHANEL_ID> - Set Chat LB channel',
          '+vclb <CHANEL_ID> - Set VC LB channel',
          '+shopsetup - Setup shop (Admin)',
          '+addcred @user <amount> - Add credits (Admin)',
          '+removecred @user <amount> - Remove credits (Admin)',
          '+givedollar @user <amount> - Give $ (Owner)',
          '+giveltc @user <amount> - Give LTC Ł (Owner)',
          '+ranksetup - Manage rank rewards (Admin)'
        ]
      },
      utility: {
        emoji: '❓',
        name: 'Utility',
        commands: [
          '+avatar [@user] - View user avatar',
          '+help - Show this help menu',
          '+uwu [@user] - Send uwu message'
        ]
      }
    };
    
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle(' Ɗʀᴇᴀᴍ ୨୧ 卄ᴀɴɢᴏᴜᴛᴢ help menu ')
        .setDescription('Here are all the available command categories:')
        .addFields(
          Object.entries(categories).map(([key, cat]) => ({
            name: `${cat.emoji} ${cat.name}`,
            value: `\`+help ${key}\``,
            inline: true
          }))
        )
        .addFields({ 
          name: '💡 How to Earn Credits', 
          value: '• Chat in channels = XP & credits\n• Use +daily every 24h\n• Stay active for faster growth',
          inline: false 
        })
        .addFields({ 
          name: '🔐 Hidden Admin Commands', 
          value: 'Use `/help hidden` to see admin-only commands',
          inline: false 
        })
        .setFooter({ text: 'Use +help <category> for more info' })
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }
    
    const categoryArg = args[0].toLowerCase();
    
    // Check if user is asking for hidden commands
    if (categoryArg === 'hidden') {
      const settings = client.db.getGuildSettings(message.guild.id) || {};
      const isAdmin = message.member.permissions.has('Administrator') || 
                    message.member.roles.cache.has('1434201704253100095') ||
                    (settings.admins && settings.admins.includes(message.author.id)) ||
                    message.author.id === '1434201654906847313';

      if (!isAdmin) {
        return message.reply('❌ Hidden commands are admin-only.');
      }
      
      const hiddenEmbed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🔐 Hidden Admin Commands')
        .setDescription('These commands are admin-only and use the % prefix:')
        .addFields(
          { name: '%dh.dm <user> <message>', value: 'Send a direct message to a user', inline: false },
          { name: '%dh.timer <time>', value: 'Create a timer (e.g., 5m, 30s, 2h)', inline: false },
          { name: '%dh.help', value: 'Show all hidden commands (admin only)', inline: false },
          { name: '%dh.jvc <VC_ID>', value: 'Join a voice channel and go AFK', inline: false },
          { name: '%dh.text <message>', value: 'Send a text message', inline: false },
          { name: '%rn <new_name>', value: 'Rename the current channel', inline: false },
          { name: '%dh.welcome-setup <channel_id> <join_message>', value: 'Setup welcome message for new members (@joiner replaces with username)', inline: false },
          { name: '%dh.dmall <message>', value: 'Send DM to all users who joined the guild', inline: false }
        )
        .setFooter({ text: 'These commands are for admins only' })
        .setTimestamp();
      
      return message.reply({ embeds: [hiddenEmbed] });
    }
    
    const category = categories[categoryArg];
    if (!category) {
      return message.reply('❌ Invalid category! Use `+help` to see all categories.');
    }
    
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`${category.emoji} ${category.name} Commands`)
      .setDescription(category.commands.map(cmd => `• ${cmd}`).join('\n'))
      .setFooter({ text: 'Use +help to see all categories' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
