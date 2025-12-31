const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shopsetup',
  description: 'Setup shop items (Admin only)',
  adminOnly: true,
  async execute(message, args, client) {
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🛒 Shop Setup')
        .setDescription('Use the following commands to manage shop items:')
        .addFields(
          { name: 'Add Item', value: '`+shopsetup add <id> <price> <name> | <description>`', inline: false },
          { name: 'Add Role Item', value: '`+shopsetup addrole <id> <price> <@role> <name> | <description>`', inline: false },
          { name: 'Remove Item', value: '`+shopsetup remove <id>`', inline: false },
          { name: 'List Items', value: '`+shopsetup list`', inline: false }
        )
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }
    
    const subcommand = args[0].toLowerCase();
    
    if (subcommand === 'add') {
      const itemId = args[1];
      const price = parseInt(args[2]);
      const rest = args.slice(3).join(' ').split('|');
      const name = rest[0]?.trim();
      const description = rest[1]?.trim() || '';
      
      if (!itemId || !price || !name) {
        return message.reply('❌ Usage: `+shopsetup add <id> <price> <name> | <description>`');
      }
      
      client.db.addShopItem(message.guild.id, itemId, name, description, price);
      
      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ Item Added')
        .addFields(
          { name: 'ID', value: itemId, inline: true },
          { name: 'Name', value: name, inline: true },
          { name: 'Price', value: `${price} credits`, inline: true }
        )
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } else if (subcommand === 'addrole') {
      const itemId = args[1];
      const price = parseInt(args[2]);
      const role = message.mentions.roles.first();
      const rest = args.slice(4).join(' ').split('|');
      const name = rest[0]?.trim();
      const description = rest[1]?.trim() || '';
      
      if (!itemId || !price || !role || !name) {
        return message.reply('❌ Usage: `+shopsetup addrole <id> <price> <@role> <name> | <description>`');
      }
      
      client.db.addShopItem(message.guild.id, itemId, name, description, price, role.id);
      
      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ Role Item Added')
        .addFields(
          { name: 'ID', value: itemId, inline: true },
          { name: 'Name', value: name, inline: true },
          { name: 'Price', value: `${price} credits`, inline: true },
          { name: 'Role', value: `${role}`, inline: true }
        )
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } else if (subcommand === 'remove') {
      const itemId = args[1];
      
      if (!itemId) {
        return message.reply('❌ Usage: `+shopsetup remove <id>`');
      }
      
      client.db.removeShopItem(message.guild.id, itemId);
      
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('✅ Item Removed')
        .setDescription(`Removed item **${itemId}** from the shop`)
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } else if (subcommand === 'list') {
      const items = client.db.getShopItems(message.guild.id);
      
      if (items.length === 0) {
        return message.reply('❌ No shop items configured!');
      }
      
      let description = '';
      for (const item of items) {
        description += `**${item.item_id}** - ${item.name} (${item.price} credits)\n`;
      }
      
      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🛒 Shop Items')
        .setDescription(description)
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    }
  }
};
