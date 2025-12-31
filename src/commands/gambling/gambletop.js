const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'gambletop',
  description: 'View the gambling leaderboard',
  async execute(message, args, client) {
    const topUsers = client.db.getGambleTop(message.guild.id, 10);
    
    if (topUsers.length === 0) {
      return message.reply('❌ No one has gambled yet!');
    }
    
    let description = '';
    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      try {
        const member = await client.users.fetch(user.user_id);
        description += `${medal} **${member.username}** - ${user.total_won.toLocaleString()} credits won\n`;
      } catch {
        description += `${medal} Unknown User - ${user.total_won.toLocaleString()} credits won\n`;
      }
    }
    
    const embed = new EmbedBuilder()
      .setColor('#E67E22')
      .setTitle('🎰 Gambling Leaderboard')
      .setDescription(description)
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
