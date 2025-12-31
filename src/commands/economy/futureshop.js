const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'futureshop',
  aliases: ['future', 'futureplan'],
  description: 'Reserve credits for future purchases in the shop',
  execute(message, args, client) {
    const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'add' || subcommand === 'reserve') {
      return handleAddItem(message, args, client);
    } else if (subcommand === 'remove' || subcommand === 'cancel') {
      return handleRemoveItem(message, args, client);
    } else if (subcommand === 'view' || subcommand === 'list' || !subcommand) {
      return handleViewItems(message, args, client);
    } else {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Invalid Command')
        .setDescription('Use `+futureshop view` to see your reservations.\nUse `+futureshop add <amount> <item_name>` to reserve credits.\nUse `+futureshop remove <item_name>` to cancel a reservation.')
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }
  }
};

function handleAddItem(message, args, client) {
  const amount = parseInt(args[1]);
  const itemName = args.slice(2).join(' ');

  if (!amount || isNaN(amount) || amount <= 0) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ Invalid Amount')
      .setDescription('Please provide a valid amount of credits to reserve.\n`+futureshop add <amount> <item_name>`')
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  if (!itemName) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ Missing Item Name')
      .setDescription('Please provide a name for the item you want to reserve.\n`+futureshop add <amount> <item_name>`')
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  const result = client.db.addFutureShopItem(message.guild.id, message.author.id, itemName, amount);

  if (!result.success) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ Reservation Failed')
      .setDescription(result.error)
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  const newBalance = client.db.getBalance(message.guild.id, message.author.id);
  const embed = new EmbedBuilder()
    .setColor('#2ECC71')
    .setTitle('✅ Item Reserved')
    .setDescription(`You successfully reserved credits for **${itemName}**`)
    .addFields(
      { name: 'Credits Reserved', value: `**${amount.toLocaleString()}** 💰`, inline: true },
      { name: 'Your Balance', value: `**${newBalance.toLocaleString()}** 💰`, inline: true }
    )
    .setFooter({ text: `Requested by ${message.author.tag}` })
    .setTimestamp();

  message.reply({ embeds: [embed] });
}

function handleRemoveItem(message, args, client) {
  const itemName = args.slice(1).join(' ');

  if (!itemName) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ Missing Item Name')
      .setDescription('Please provide the item name to cancel.\n`+futureshop remove <item_name>`')
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  const result = client.db.removeFutureShopItem(message.guild.id, message.author.id, itemName);

  if (!result.success) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ Cancellation Failed')
      .setDescription(result.error)
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  const newBalance = client.db.getBalance(message.guild.id, message.author.id);
  const embed = new EmbedBuilder()
    .setColor('#2ECC71')
    .setTitle('✅ Reservation Cancelled')
    .setDescription(`You cancelled the reservation for **${itemName}**`)
    .addFields(
      { name: 'Credits Refunded', value: `**${newBalance.toLocaleString()}** 💰 (available again)`, inline: false }
    )
    .setFooter({ text: `Requested by ${message.author.tag}` })
    .setTimestamp();

  message.reply({ embeds: [embed] });
}

function handleViewItems(message, args, client) {
  const items = client.db.getFutureShopItems(message.guild.id, message.author.id);
  const balance = client.db.getBalance(message.guild.id, message.author.id);

  if (items.length === 0) {
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('📦 Future Shop')
      .setDescription('You have no reserved items yet.\nUse `+futureshop add <amount> <item_name>` to reserve credits for future purchases.')
      .addFields({ name: 'Your Balance', value: `${balance.toLocaleString()} credits`, inline: true })
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  let totalReserved = 0;
  let description = '';
  for (const item of items) {
    totalReserved += item.credits_reserved;
    const date = new Date(item.reserved_at * 1000).toLocaleDateString();
    description += `**${item.item_name}**\n   💰 ${item.credits_reserved.toLocaleString()} credits | 📅 ${date}\n\n`;
  }

  const embed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('📦 Future Shop Reservations')
    .setDescription(description || 'No items reserved')
    .addFields(
      { name: 'Total Reserved', value: `${totalReserved.toLocaleString()} credits`, inline: true },
      { name: 'Available Balance', value: `${balance.toLocaleString()} credits`, inline: true }
    )
    .setFooter({ text: 'Use +futureshop remove <item_name> to cancel a reservation' })
    .setTimestamp();

  message.reply({ embeds: [embed] });
}
