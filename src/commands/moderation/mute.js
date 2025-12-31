const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'mute',
  description: 'Mute a user',
  modOnly: true,
  async execute(message, args, client) {
    const target = message.mentions.members.first();
    const timeStr = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';
    
    if (!target || !timeStr) {
      return message.reply('❌ Usage: `+mute @user <time> <reason>`\nExample: `+mute @user 1h Spam`');
    }
    
    const timeMatch = timeStr.match(/^(\d+)(s|m|h|d)$/);
    if (!timeMatch) {
      return message.reply('❌ Invalid time format! Use: 30s, 5m, 1h, 1d');
    }
    
    const amount = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    
    let duration;
    switch (unit) {
      case 's': duration = amount * 1000; break;
      case 'm': duration = amount * 60 * 1000; break;
      case 'h': duration = amount * 60 * 60 * 1000; break;
      case 'd': duration = amount * 24 * 60 * 60 * 1000; break;
    }
    
    try {
      await target.timeout(duration, reason);
      client.db.addMute(message.guild.id, target.id, message.author.id, reason, duration);
      
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🔇 User Muted')
        .addFields(
          { name: 'User', value: `${target}`, inline: true },
          { name: 'Duration', value: timeStr, inline: true },
          { name: 'Moderator', value: `${message.author}`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
      
      try {
        await target.send(`🔇 You have been muted in **${message.guild.name}** for ${timeStr}\nReason: ${reason}`);
      } catch {
        // User has DMs disabled
      }
    } catch (err) {
      message.reply('❌ Failed to mute user. Make sure I have the right permissions!');
    }
  }
};
