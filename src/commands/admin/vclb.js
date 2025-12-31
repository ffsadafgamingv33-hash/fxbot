const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'vclb',
  description: 'Set the VC leaderboard channel',
  adminOnly: true,
  execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply('❌ Please provide a valid channel or mention one.');

    const settings = client.db.getGuildSettings(message.guild.id) || {};
    settings.vcLBChannel = channel.id;
    client.db.setGuildSettings(message.guild.id, settings);

    message.reply(`✅ VC leaderboard channel set to ${channel}`);
  }
};
