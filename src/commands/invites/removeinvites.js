const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removeinvites',
  description: 'Remove invites from a user (Owner only)',
  ownerOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    
    if (!target || !amount || amount < 1) {
      return message.reply('❌ Usage: `+removeinvites @user <amount>`');
    }
    
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('✅ Invites Removed')
      .setDescription(`Removed **${amount}** invites from ${target}`)
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
