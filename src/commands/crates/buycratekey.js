const { EmbedBuilder } = require('discord.js');
const { CRATE_TYPES } = require('./crateinfo');

module.exports = {
  name: 'buycratekey',
  description: 'Buy a crate key',
  execute(message, args, client) {
    const type = args[0]?.toLowerCase();
    
    if (!type || !CRATE_TYPES[type]) {
      return message.reply('❌ Invalid crate type! Types: `common`, `rare`, `legendary`');
    }
    
    const crate = CRATE_TYPES[type];
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    
    if (balance < crate.keyPrice) {
      return message.reply(`❌ You need **${crate.keyPrice}** credits to buy a ${type} key! Your balance: ${balance.toLocaleString()}`);
    }
    
    client.db.removeCredits(message.guild.id, message.author.id, crate.keyPrice);
    client.db.addCrateKey(message.guild.id, message.author.id, type);
    
    const newBalance = client.db.getBalance(message.guild.id, message.author.id);
    
    const embed = new EmbedBuilder()
      .setColor(crate.color)
      .setTitle(`${crate.emoji} Key Purchased!`)
      .setDescription(`You bought a **${crate.name}** key for **${crate.keyPrice}** credits!`)
      .addFields({ name: 'Remaining Balance', value: `${newBalance.toLocaleString()} credits`, inline: true })
      .setFooter({ text: 'Use +opencrate to open your crate!' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
