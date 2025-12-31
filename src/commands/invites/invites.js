const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'invites',
  description: 'View your invite statistics',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const stats = client.db.getInviteStats(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle(`📨 ${target.username}'s Invites`)
      .addFields(
        { name: 'Total Invites', value: `${stats.total}`, inline: true },
        { name: 'Valid Invites', value: `${stats.valid}`, inline: true },
        { name: 'Left/Invalid', value: `${stats.total - stats.valid}`, inline: true }
      )
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: 'Invite friends to earn rewards!' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
