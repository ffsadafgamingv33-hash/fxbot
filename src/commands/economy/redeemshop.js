const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'redeemshop',
  aliases: ['redeemcode', 'buycodes'],
  description: 'Buy redeem codes with your credits',
  execute(message, args, client) {
    const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'buy') {
      return handleBuyCode(message, args, client);
    } else if (subcommand === 'view' || !subcommand) {
      return handleViewCodes(message, args, client);
    } else {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Invalid Command')
        .setDescription('Use `+redeemshop view` to see available codes.\nUse `+redeemshop buy <10/100/1000>` to purchase a code.')
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }
  }
};

function handleViewCodes(message, args, client) {
  const stats = client.db.getRedeemCodeStats();
  const balance = client.db.getBalance(message.guild.id, message.author.id);

  const embed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('🎁 Redeem Code Shop')
    .setDescription('Purchase redeem codes with your credits!')
    .addFields(
      { name: '💰 10 Credit Code', value: 'Price: **10,000 credits**\nUse: `+redeemshop buy 10`', inline: true },
      { name: '💰 100 Credit Code', value: 'Price: **100,000 credits**\nUse: `+redeemshop buy 100`', inline: true },
      { name: '💰 1000 Credit Code', value: 'Price: **1,000,000 credits**\nUse: `+redeemshop buy 1000`', inline: true },
      { name: 'Your Balance', value: `**${balance.toLocaleString()}** credits`, inline: false }
    )
    .setFooter({ text: 'Codes will be sent to your DM after purchase' })
    .setTimestamp();

  message.reply({ embeds: [embed] });
}

function handleBuyCode(message, args, client) {
  const codeType = args[1];
  const prices = {
    '10': 10000,
    '100': 100000,
    '1000': 1000000
  };

  if (!prices[codeType]) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ Invalid Code Type')
      .setDescription('Valid types: `10`, `100`, or `1000`\nUse: `+redeemshop buy <10/100/1000>`')
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  const price = prices[codeType];
  const balance = client.db.getBalance(message.guild.id, message.author.id);

  if (balance < price) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ Not Enough Credits')
      .setDescription(`You need **${price.toLocaleString()}** credits but only have **${balance.toLocaleString()}**`)
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  let redeemCode = client.db.getSpecificRedeemCode(parseInt(codeType));

  if (!redeemCode) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle('❌ No Codes Available')
      .setDescription(`Sorry, there are no unused ${codeType} credit codes available right now.`)
      .setFooter({ text: `Requested by ${message.author.tag}` });
    return message.reply({ embeds: [embed] });
  }

  // Remove credits from user
  client.db.removeCredits(message.guild.id, message.author.id, price);
  const newBalance = client.db.getBalance(message.guild.id, message.author.id);

  // Send code to user's DM
  try {
    const dmEmbed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('🎁 Your Redeem Code')
      .setDescription(`You purchased a **${codeType} credit** redeem code!`)
      .addFields(
        { name: 'Code', value: `\`${redeemCode.code}\``, inline: false },
        { name: 'Value', value: `**${redeemCode.credits} credits**`, inline: false },
        { name: 'How to Redeem', value: `Use \`+redeem ${redeemCode.code}\` in any server to claim your credits!`, inline: false }
      )
      .setFooter({ text: 'Keep this code safe - it can only be redeemed once!' })
      .setTimestamp();

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});
  } catch (err) {
    console.error('Could not send DM:', err);
  }

  // Confirm purchase in channel
  const embed = new EmbedBuilder()
    .setColor('#2ECC71')
    .setTitle('✅ Purchase Successful!')
    .setDescription(`You purchased a **${codeType} credit** redeem code for **${price.toLocaleString()}** credits!`)
    .addFields(
      { name: 'Code Sent', value: 'Check your DMs for your redeem code! 📬', inline: false },
      { name: 'New Balance', value: `**${newBalance.toLocaleString()}** credits`, inline: true }
    )
    .setFooter({ text: `Requested by ${message.author.tag}` })
    .setTimestamp();

  message.reply({ embeds: [embed] });
}
