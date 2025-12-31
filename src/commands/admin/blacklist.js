const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'blacklist',
  description: 'Manage blacklist (Admin only)',
  adminOnly: true,
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('🚫 Blacklist Management')
      .setDescription('Blacklist feature is not fully implemented yet.\n\nThis would allow you to blacklist users from using bot commands.')
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
