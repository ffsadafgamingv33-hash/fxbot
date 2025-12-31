const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'level',
  aliases: ['rank', 'xp'],
  description: 'Check your XP level',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const userData = client.db.getUser(message.guild.id, target.id);
    const xpNeeded = client.db.getXPForLevel(userData.level + 1);
    const progress = Math.floor((userData.xp / xpNeeded) * 100);
    
    const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
    
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`📊 ${target.username}'s Level`)
      .addFields(
        { name: 'Level', value: `${userData.level}`, inline: true },
        { name: 'XP', value: `${userData.xp}/${xpNeeded}`, inline: true },
        { name: 'Progress', value: `[${progressBar}] ${progress}%`, inline: false }
      )
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: 'Earn XP by chatting!' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
