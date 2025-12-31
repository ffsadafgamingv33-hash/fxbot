const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'warn',
  description: 'Warn a user',
  modOnly: true,
  async execute(message, args, client) {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    if (!target) {
      return message.reply('❌ Please mention a user to warn! Usage: `+warn @user <reason>`');
    }
    
    client.db.addWarning(message.guild.id, target.id, message.author.id, reason);
    const warnings = client.db.getWarnings(message.guild.id, target.id);
    
    const embed = new EmbedBuilder()
      .setColor('#E67E22')
      .setTitle('⚠️ User Warned')
      .addFields(
        { name: 'User', value: `${target}`, inline: true },
        { name: 'Moderator', value: `${message.author}`, inline: true },
        { name: 'Total Warnings', value: `${warnings.length}`, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setThumbnail(target.displayAvatarURL())
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
    
    try {
      await target.send(`⚠️ You have been warned in **${message.guild.name}**\nReason: ${reason}\nTotal Warnings: ${warnings.length}`);
    } catch {
      // User has DMs disabled
    }
  }
};
