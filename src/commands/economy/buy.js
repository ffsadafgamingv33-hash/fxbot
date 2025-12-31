const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'buy',
  description: 'Purchase an item from the shop',
  async execute(message, args, client) {
    if (!args[0]) {
      return message.reply('❌ Please specify an item ID! Usage: `+buy <item_id>`');
    }
    
    const itemId = args[0].toLowerCase();
    const result = client.db.buyItem(message.guild.id, message.author.id, itemId);
    
    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Purchase Failed')
        .setDescription(result.error)
        .setFooter({ text: `Requested by ${message.author.tag}` });
      
      return message.reply({ embeds: [embed] });
    }
    
    // If the item has a role, assign it
    if (result.item.role_id) {
      try {
        const role = message.guild.roles.cache.get(result.item.role_id);
        if (role) {
          await message.member.roles.add(role);
        }
      } catch (err) {
        console.error('Could not assign role:', err);
      }
    }
    
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    
    // Get a random redeem code for the purchase
    const redeemCode = client.db.getRandomUnusedRedeemCode();
    
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Purchase Successful!')
      .setDescription(`You purchased **${result.item.name}** for **${result.item.price.toLocaleString()}** credits!`)
      .addFields(
        { name: 'Remaining Balance', value: `${balance.toLocaleString()} credits`, inline: true }
      );
    
    if (redeemCode) {
      embed.addFields({
        name: '🎁 Bonus Redeem Code!',
        value: `You received: \`${redeemCode.code}\` (${redeemCode.credits} credits)\nUse \`+redeem ${redeemCode.code}\` to claim!`,
        inline: false
      });
    }
    
    embed.setThumbnail(message.author.displayAvatarURL())
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
