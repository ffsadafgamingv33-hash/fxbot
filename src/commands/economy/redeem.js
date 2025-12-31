const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'redeem',
  aliases: ['code', 'redeemcode'],
  description: 'Redeem a code for credits',
  cooldown: 2,
  execute(message, args, client) {
    const code = args[0];

    if (!code) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Missing Code')
        .setDescription('Please provide a redeem code.\n`+redeem <code>`')
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    const result = client.db.redeemCode(code, message.author.id);

    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Redeem Failed')
        .setDescription(result.error)
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    client.db.addCredits(message.guild.id, message.author.id, result.credits);
    const newBalance = client.db.getBalance(message.guild.id, message.author.id);

    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Code Redeemed!')
      .setDescription(`You successfully redeemed the code!`)
      .addFields(
        { name: 'Credits Received', value: `**${result.credits.toLocaleString()}** 💰`, inline: true },
        { name: 'New Balance', value: `**${newBalance.toLocaleString()}** 💰`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
