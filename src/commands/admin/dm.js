const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dm',
  hidden: true,
  adminOnly: true,
  description: 'Send a DM to a user',
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const msg = args.slice(1).join(' ');

    if (!target) return message.reply('❌ Please mention a user. Usage: `%dh.dm <user> <message>`');
    if (!msg) return message.reply('❌ Please provide a message. Usage: `%dh.dm <user> <message>`');

    target.send(msg).then(() => {
      message.reply(`✅ DM sent to ${target}`);
    }).catch(() => {
      message.reply(`❌ Could not send DM to ${target}. They may have DMs disabled.`);
    });
  }
};
