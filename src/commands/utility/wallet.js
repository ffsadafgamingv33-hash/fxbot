const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'wallet',
  aliases: ['bal', 'money', 'net'],
  description: 'View your wallet with all currencies',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const credits = client.db.getBalance(message.guild.id, target.id);
    const dollars = client.db.getDollars(message.guild.id, target.id);
    const ltc = client.db.getLTC(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`💰 ${target.username}'s Wallet`)
      .addFields(
        { name: '💵 Credits', value: `${credits.toLocaleString()} ⭐`, inline: true },
        { name: '💲 Dollars', value: `$${dollars.toLocaleString()}`, inline: true },
        { name: '₿ Litecoin', value: `Ł${ltc.toLocaleString()}`, inline: true }
      )
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
