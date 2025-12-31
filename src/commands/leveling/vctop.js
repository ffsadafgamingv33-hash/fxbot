const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'vctop',
  aliases: ['vtop', 'lbvc'],
  description: 'View the voice channel leaderboard',
  execute(message, args, client) {
    const top = client.db.getVCTop(message.guild.id);
    if (!top || top.length === 0) return message.reply('❌ No data found.');

    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('🎙️ VC Leaderboard')
      .setDescription(top.map((u, i) => `**${i + 1}.** <@${u.user_id}> - \`${Math.floor(u.vc_minutes / 60)}h ${u.vc_minutes % 60}m\``).join('\n'))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
