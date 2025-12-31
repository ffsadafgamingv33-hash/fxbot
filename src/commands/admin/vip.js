const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'wl_vip',
  description: 'Whitelist a VIP user (Admin only)',
  adminOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Usage: `+wl_vip @user`');
    }
    
    client.db.addVIPWhitelist(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('⭐ VIP Whitelisted')
      .setDescription(`${target} has been added to the VIP whitelist!`)
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
