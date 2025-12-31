const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'addcred',
  aliases: ['addcredits'],
  description: 'Add credits to a user (Admin only)',
  adminOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    
    if (!target || !amount || amount < 1) {
      return message.reply('❌ Usage: `+addcred @user <amount>`');
    }
    
    client.db.addCredits(message.guild.id, target.id, amount);
    const newBalance = client.db.getBalance(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Credits Added')
      .setDescription(`Added **${amount.toLocaleString()}** credits to ${target}`)
      .addFields({ name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
