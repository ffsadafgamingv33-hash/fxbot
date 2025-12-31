const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'clb',
  description: 'Set the chat leaderboard channel',
  adminOnly: true,
  execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply('❌ Please provide a valid channel or mention one.');

    const settings = client.db.getGuildSettings(message.guild.id) || {};
    settings.chatLBChannel = channel.id;
    client.db.setGuildSettings(message.guild.id, settings);

    message.reply(`✅ Chat leaderboard channel set to ${channel}`);
  }
};
