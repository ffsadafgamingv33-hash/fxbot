const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shop',
  description: 'Browse the credit shop',
  execute(message, args, client) {
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('🛒 Dream Hangoutz Shop')
      .setDescription('Visit our official shop: **https://shop.dreamhangoutz.qzz.io**\n\nOr use `+buy <item_id>` to purchase items in-game!')
      .addFields(
        { name: '🎫 VIP Role', value: 'Price: **1,000,000 credits**\nID: `vip`', inline: true },
        { name: '📦 Basic Crate Key', value: 'Price: **50,000 credits**\nID: `crate_key`', inline: true }
      )
      .addFields(
        { name: '🔗 Official Shop Link', value: '[shop.dreamhangoutz.qzz.io](https://shop.dreamhangoutz.qzz.io)', inline: false }
      )
      .setFooter({ text: `Your Balance: ${balance.toLocaleString()} credits` });
    
    message.reply({ embeds: [embed] });
  }
};
