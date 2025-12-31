const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'daily',
  description: 'Claim your daily credits',
  execute(message, args, client) {
    const result = client.db.claimDaily(message.guild.id, message.author.id);
    
    if (!result.success) {
      const timeLeft = result.nextClaim - Date.now();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('⏰ Daily Already Claimed')
        .setDescription(`You can claim your daily reward again in **${hours}h ${minutes}m**`)
        .setFooter({ text: `Requested by ${message.author.tag}` });
      
      return message.reply({ embeds: [embed] });
    }
    
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Daily Reward Claimed!')
      .setDescription(`You received **${result.reward}** credits!`)
      .addFields({ name: 'New Balance', value: `${balance.toLocaleString()} credits`, inline: true })
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter({ text: 'Come back in 24 hours for more!' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
