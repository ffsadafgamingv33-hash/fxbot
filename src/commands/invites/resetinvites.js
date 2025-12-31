const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'resetinvites',
  description: 'Reset invites (Owner only)',
  ownerOnly: true,
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('🔄 Invites Reset')
      .setDescription('All invites have been reset.')
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
