const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'giveltc',
  aliases: ['giveltcs', 'giveltc'],
  description: 'Give LTC currency to a user (Owner only)',
  ownerOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseFloat(args[1]);
    
    if (!target || isNaN(amount) || amount <= 0) {
      return message.reply('❌ Usage: `+giveltc @user <amount>`');
    }
    
    client.db.addLTC(message.guild.id, target.id, amount);
    const newBalance = client.db.getLTC(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#FF6B00')
      .setTitle('✅ LTC Given')
      .setDescription(`Given **${amount}** LTC to ${target}`)
      .addFields({ name: 'New Balance', value: `Ł${newBalance.toFixed(4)}`, inline: true })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
