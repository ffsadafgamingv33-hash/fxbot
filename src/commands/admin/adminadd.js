const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'adminadd',
  description: 'Add a user as a bot administrator',
  ownerOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('❌ Please mention a user to add as admin.');

    const settings = client.db.getGuildSettings(message.guild.id) || {};
    if (!settings.admins) settings.admins = [];
    
    if (settings.admins.includes(target.id)) return message.reply('❌ This user is already an admin.');
    
    settings.admins.push(target.id);
    client.db.setGuildSettings(message.guild.id, settings);

    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Admin Added')
      .setDescription(`${target} has been added as a bot administrator.`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
