const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'profile',
  aliases: ['prof', 'p'],
  description: 'View user profile with rank and stats',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const user = client.db.getUser(message.guild.id, target.id);
    
    // Calculate rank (leaderboard position)
    const allUsers = client.db.db.prepare('SELECT user_id, level, xp FROM users WHERE guild_id = ? ORDER BY level DESC, credits DESC').all(message.guild.id);
    const rank = allUsers.findIndex(u => u.user_id === target.id) + 1 || 'N/A';
    
    // Calculate XP for next level
    const xpForNextLevel = client.db.getXPForLevel(user.level + 1);
    const xpForCurrentLevel = client.db.getXPForLevel(user.level);
    const xpInCurrentLevel = user.xp;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = Math.min(xpInCurrentLevel, xpNeeded);
    
    // Get about me bio (from guild settings)
    const settings = client.db.getGuildSettings(message.guild.id) || {};
    const userBios = settings.userBios || {};
    const aboutMe = userBios[target.id] || 'No bio set yet. Use `+setbio <text>`';
    
    // Create profile embed
    const embed = new EmbedBuilder()
      .setColor('#F39C12')
      .setAuthor({ 
        name: target.username, 
        iconURL: target.displayAvatarURL() 
      })
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { 
          name: '📊 Level', 
          value: `**${user.level}**`, 
          inline: true 
        },
        { 
          name: '🏅 Rank', 
          value: `**#${rank.toLocaleString()}**`, 
          inline: true 
        },
        { 
          name: '💰 Credits', 
          value: `**${user.credits.toLocaleString()}** ⭐`, 
          inline: true 
        },
        { 
          name: '⚡ Experience Points', 
          value: `**${xpInCurrentLevel.toLocaleString()}** / **${xpNeeded.toLocaleString()}**`, 
          inline: false 
        },
        {
          name: '💎 Premium Currencies',
          value: `**$${user.dollars.toFixed(2)}** Dollars\n**Ł${user.ltc.toFixed(2)}** LTC`,
          inline: false
        },
        { 
          name: '📝 About Me', 
          value: aboutMe, 
          inline: false 
        }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
