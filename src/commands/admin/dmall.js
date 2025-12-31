const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dmall',
  hidden: true,
  adminOnly: true,
  description: 'Send DM to all users who joined the guild',
  async execute(message, args, client) {
    const msg = args.join(' ');
    if (!msg) return message.reply('❌ Please provide a message. Usage: `%dh.dmall <message>`');

    try {
      const members = await message.guild.members.fetch();
      let sent = 0;
      let failed = 0;

      for (const member of members.values()) {
        if (member.user.bot) continue;

        member.user.send(msg).then(() => {
          sent++;
        }).catch(() => {
          failed++;
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('📧 Mass DM Complete')
        .addFields(
          { name: 'Sent', value: `${sent}`, inline: true },
          { name: 'Failed', value: `${failed}`, inline: true }
        )
        .setTimestamp();

      setTimeout(() => {
        message.reply({ embeds: [embed] });
      }, 2000);
    } catch (err) {
      message.reply(`❌ Error: ${err.message}`);
    }
  }
};
