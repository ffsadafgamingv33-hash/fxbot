const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'inventory',
  aliases: ['inv'],
  description: 'View your purchased items',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const inventory = client.db.getInventory(message.guild.id, target.id);
    
    if (inventory.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('📦 Inventory')
        .setDescription(`${target.id === message.author.id ? 'You don\'t' : `${target.username} doesn't`} have any items yet!`)
        .setFooter({ text: 'Use +shop to browse available items' });
      
      return message.reply({ embeds: [embed] });
    }
    
    let description = '';
    for (const item of inventory) {
      const date = new Date(item.purchased_at * 1000).toLocaleDateString();
      description += `📦 **${item.item_name}** (ID: ${item.item_id})\n   Purchased: ${date}\n\n`;
    }
    
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle(`📦 ${target.username}'s Inventory`)
      .setDescription(description)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `${inventory.length} item(s)` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
