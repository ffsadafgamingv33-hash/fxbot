const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unwarn',
  description: 'Remove the last warning from a user',
  modOnly: true,
  execute(message, args, client) {
    const target = message.mentions.members.first();
    
    if (!target) {
      return message.reply('❌ Please mention a user! Usage: `+unwarn @user`');
    }
    
    const warningsBefore = client.db.getWarnings(message.guild.id, target.id);
    
    if (warningsBefore.length === 0) {
      return message.reply('❌ This user has no warnings!');
    }
    
    client.db.removeLastWarning(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Warning Removed')
      .setDescription(`Removed the last warning from ${target}`)
      .addFields({ name: 'Remaining Warnings', value: `${warningsBefore.length - 1}`, inline: true })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
