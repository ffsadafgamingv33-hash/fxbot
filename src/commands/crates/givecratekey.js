const { EmbedBuilder } = require('discord.js');
const { CRATE_TYPES } = require('./crateinfo');

module.exports = {
  name: 'givecratekey',
  description: 'Give crate keys to a user (Owner only)',
  ownerOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const type = args[1]?.toLowerCase();
    const amount = parseInt(args[2]) || 1;
    
    if (!target || !type || !CRATE_TYPES[type]) {
      return message.reply('❌ Usage: `+givecratekey @user <type> [amount]`\nTypes: common, rare, legendary');
    }
    
    client.db.addCrateKey(message.guild.id, target.id, type, amount);
    
    const crate = CRATE_TYPES[type];
    
    const embed = new EmbedBuilder()
      .setColor(crate.color)
      .setTitle(`${crate.emoji} Keys Given!`)
      .setDescription(`Gave **${amount}** ${crate.name} key(s) to ${target}`)
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
