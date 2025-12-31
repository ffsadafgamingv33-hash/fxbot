const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removecred',
  aliases: ['removecredits'],
  description: 'Remove credits from a user (Admin only)',
  adminOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    
    if (!target || !amount || amount < 1) {
      return message.reply('❌ Usage: `+removecred @user <amount>`');
    }
    
    client.db.removeCredits(message.guild.id, target.id, amount);
    const newBalance = client.db.getBalance(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('✅ Credits Removed')
      .setDescription(`Removed **${amount.toLocaleString()}** credits from ${target}`)
      .addFields({ name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
