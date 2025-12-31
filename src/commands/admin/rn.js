const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rn',
  hidden: true,
  adminOnly: true,
  description: 'Rename the current channel',
  async execute(message, args, client) {
    const newName = args.join(' ');
    if (!newName) return message.reply('❌ Please provide a new channel name. Usage: `%rn <new_name>`');

    try {
      await message.channel.setName(newName);
      message.reply(`✅ Channel renamed to: **${newName}**`);
    } catch (err) {
      message.reply(`❌ Could not rename channel: ${err.message}`);
    }
  }
};
