const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'balancetop',
  aliases: ['baltop', 'rich', 'leaderboard'],
  description: 'View the credit leaderboard',
  async execute(message, args, client) {
    const topUsers = client.db.getBalanceTop(message.guild.id, 10);
    
    if (topUsers.length === 0) {
      return message.reply('❌ No users have credits yet!');
    }
    
    let description = '';
    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      try {
        const member = await client.users.fetch(user.user_id);
        description += `${medal} **${member.username}** - ${user.credits.toLocaleString()} credits\n`;
      } catch {
        description += `${medal} Unknown User - ${user.credits.toLocaleString()} credits\n`;
      }
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💎 Credit Leaderboard')
      .setDescription(description)
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
