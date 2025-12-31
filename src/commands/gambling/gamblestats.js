const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'gamblestats',
  description: 'View your gambling statistics',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const userData = client.db.getUser(message.guild.id, target.id);
    
    const netProfit = userData.total_won - userData.total_lost;
    const profitColor = netProfit >= 0 ? '#2ECC71' : '#E74C3C';
    
    const embed = new EmbedBuilder()
      .setColor(profitColor)
      .setTitle(`🎰 ${target.username}'s Gambling Stats`)
      .addFields(
        { name: 'Total Wagered', value: `${userData.total_gambled.toLocaleString()} credits`, inline: true },
        { name: 'Total Won', value: `${userData.total_won.toLocaleString()} credits`, inline: true },
        { name: 'Total Lost', value: `${userData.total_lost.toLocaleString()} credits`, inline: true },
        { name: 'Net Profit', value: `${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()} credits`, inline: true }
      )
      .setThumbnail(target.displayAvatarURL())
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
