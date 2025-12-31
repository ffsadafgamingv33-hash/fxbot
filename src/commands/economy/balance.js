const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'balance',
  aliases: ['bal', 'credits'],
  description: 'Check your credit balance',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const balance = client.db.getBalance(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('💰 Credit Balance')
      .setDescription(`${target.id === message.author.id ? 'You have' : `${target.username} has`} **${balance.toLocaleString()}** credits`)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
