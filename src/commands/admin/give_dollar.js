const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'givedollar',
  aliases: ['givedollars', 'give$'],
  description: 'Give $ currency to a user (Owner only)',
  ownerOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseFloat(args[1]);
    
    if (!target || isNaN(amount) || amount <= 0) {
      return message.reply('❌ Usage: `+givedollar @user <amount>`');
    }
    
    client.db.addDollars(message.guild.id, target.id, amount);
    const newBalance = client.db.getDollars(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ $ Given')
      .setDescription(`Given **${amount}** $ to ${target}`)
      .addFields({ name: 'New Balance', value: `$${newBalance.toFixed(2)}`, inline: true })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
