const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'welcome-setup',
  hidden: true,
  adminOnly: true,
  description: 'Setup welcome message for new members',
  async execute(message, args, client) {
    const channelId = args[0];
    const joinMessage = args.slice(1).join(' ');

    if (!channelId || !joinMessage) {
      return message.reply('❌ Usage: `%dh.welcome-setup <channel_id> <join_message>`\n💡 Use @joiner to mention the new member');
    }

    try {
      const channel = await message.guild.channels.fetch(channelId);
      if (!channel) return message.reply('❌ That channel does not exist.');

      // Store welcome setup in database or settings
      const settings = client.db.getGuildSettings(message.guild.id) || {};
      settings.welcomeChannelId = channelId;
      settings.welcomeMessage = joinMessage;
      client.db.setGuildSettings(message.guild.id, settings);

      message.reply(`✅ Welcome setup configured!\n📝 Channel: <#${channelId}>\n📋 Message: ${joinMessage}`);
    } catch (err) {
      message.reply(`❌ Error: ${err.message}`);
    }
  }
};
