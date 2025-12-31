const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'pjoin',
  description: 'Uwu join message',
  execute(message, args, client) {
    const joinMessages = [
      `Welcome to the server! *glomps* uwu~`,
      `Another cutie joined! >//<`,
      `**${message.author.username}** just joined the fun! nya~! 🎉`,
      `*pounces* A new member! Welcome! owo`,
      `${message.author} has arrived! UwU let's be friends!`
    ];
    
    const msg = joinMessages[Math.floor(Math.random() * joinMessages.length)];
    
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setDescription(msg)
      .setThumbnail(message.author.displayAvatarURL());
    
    message.reply({ embeds: [embed] });
  }
};
