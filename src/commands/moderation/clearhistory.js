const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'clearhistory',
  description: 'Clear moderation history for a user',
  adminOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Please mention a user! Usage: `+clearhistory @user`');
    }
    
    client.db.clearHistory(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ History Cleared')
      .setDescription(`Cleared all moderation history for ${target}`)
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
