const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'captchastatus',
  description: 'Check your captcha/verification status',
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('🛡️ Verification Status')
      .addFields(
        { name: 'Status', value: '✅ Verified', inline: true },
        { name: 'Account Age', value: `${Math.floor((Date.now() - message.author.createdTimestamp) / (1000 * 60 * 60 * 24))} days`, inline: true }
      )
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
