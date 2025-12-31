const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'chattop',
  aliases: ['ctop', 'lbchat'],
  description: 'View the chat leaderboard',
  execute(message, args, client) {
    const top = client.db.getChatTop(message.guild.id);
    if (!top || top.length === 0) return message.reply('❌ No data found.');

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('💬 Chat Leaderboard')
      .setDescription(top.map((u, i) => `**${i + 1}.** <@${u.user_id}> - \`${u.messages.toLocaleString()}\` messages`).join('\n'))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
