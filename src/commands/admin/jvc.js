const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  name: 'jvc',
  hidden: true,
  adminOnly: true,
  description: 'Join a voice channel and go AFK',
  async execute(message, args, client) {
    const vcId = args[0];
    if (!vcId) return message.reply('❌ Please provide a voice channel ID. Usage: `%dh.jvc <VC_ID>`');

    try {
      const channel = await message.guild.channels.fetch(vcId);
      if (!channel || channel.type !== 2) { // 2 = GUILD_VOICE
        return message.reply('❌ That is not a valid voice channel.');
      }

      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      message.channel.send(`✅ Joined voice channel: ${channel.name}`);
    } catch (err) {
      message.channel.send(`❌ Could not join voice channel: ${err.message}`);
    }
  }
};
