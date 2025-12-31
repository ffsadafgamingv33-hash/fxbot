const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'Show a user\'s avatar',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const avatar = target.displayAvatarURL({ size: 2048 });
    
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`👤 ${target.username}'s Avatar`)
      .setImage(avatar)
      .setURL(avatar)
      .setFooter({ text: 'Click the title to view full size' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
