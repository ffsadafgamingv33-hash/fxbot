const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'timer',
  hidden: true,
  adminOnly: true,
  description: 'Create a timer',
  execute(message, args, client) {
    const timeStr = args[0];
    if (!timeStr) return message.reply('❌ Please provide a time. Usage: `%dh.timer <5m/30s/2h>`');

    const timeMatch = timeStr.match(/(\d+)([smh])/);
    if (!timeMatch) return message.reply('❌ Invalid time format. Use: 5s, 30m, 2h');

    const value = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    
    let ms = 0;
    if (unit === 's') ms = value * 1000;
    if (unit === 'm') ms = value * 60 * 1000;
    if (unit === 'h') ms = value * 60 * 60 * 1000;

    if (ms > 86400000) return message.reply('❌ Timer cannot exceed 24 hours');

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('⏱️ Timer Started')
      .setDescription(`Timer set for **${timeStr}**`)
      .setTimestamp();

    message.reply({ embeds: [embed] }).then(msg => {
      setTimeout(() => {
        const timerEmbed = new EmbedBuilder()
          .setColor('#2ECC71')
          .setTitle('⏰ Timer Complete!')
          .setDescription(`Your **${timeStr}** timer has finished!`)
          .setTimestamp();
        
        msg.edit({ embeds: [timerEmbed], content: `${message.author}` }).catch(() => {});
      }, ms);
    });
  }
};
