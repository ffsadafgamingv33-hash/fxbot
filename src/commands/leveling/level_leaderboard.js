const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'level_leaderboard',
  aliases: ['lvltop', 'xptop', 'levels'],
  description: 'View the XP leaderboard',
  async execute(message, args, client) {
    const topUsers = client.db.getLevelTop(message.guild.id, 10);
    
    if (topUsers.length === 0) {
      return message.reply('❌ No users have XP yet!');
    }
    
    let description = '';
    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      try {
        const member = await client.users.fetch(user.user_id);
        description += `${medal} **${member.username}** - Level ${user.level} (${user.xp} XP)\n`;
      } catch {
        description += `${medal} Unknown User - Level ${user.level} (${user.xp} XP)\n`;
      }
    }
    
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('📊 XP Leaderboard')
      .setDescription(description)
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
