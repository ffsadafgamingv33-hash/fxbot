const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unwl_vip',
  description: 'Remove a user from VIP whitelist (Admin only)',
  adminOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Usage: `+unwl_vip @user`');
    }
    
    client.db.removeVIPWhitelist(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ VIP Removed')
      .setDescription(`${target} has been removed from the VIP whitelist.`)
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
