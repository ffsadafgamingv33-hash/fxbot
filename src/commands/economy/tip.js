const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'tip',
  aliases: ['pay', 'give', 'transfer'],
  description: 'Tip credits or currencies to another user',
  cooldown: 5,
  execute(message, args, client) {
    // Check if currency type is specified
    let currencyType = 'credits';
    let targetIndex = 1;
    let amountIndex = 2;
    
    const firstArg = args[0]?.toLowerCase();
    if (firstArg === 'ltc' || firstArg === '$') {
      currencyType = firstArg === 'ltc' ? 'ltc' : 'dollar';
      targetIndex = 1;
      amountIndex = 2;
    } else {
      // Old format: +tip @user <amount> (credits)
      targetIndex = 0;
      amountIndex = 1;
    }
    
    const target = message.mentions.users.first();
    const amount = parseFloat(args[amountIndex]);

    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Invalid Target')
        .setDescription(`Please mention a user to tip ${currencyType === 'credits' ? 'credits' : currencyType} to.\n\`+tip ${currencyType === 'credits' ? '@user <amount>' : '<ltc/$> @user <amount>'}\``)
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    if (target.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Cannot Tip Yourself')
        .setDescription('You cannot tip to yourself.')
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Invalid Amount')
        .setDescription(`Please provide a valid amount to tip.\n**Usage:** \`+tip ${currencyType === 'credits' ? '@user <amount>' : '<ltc/$> @user <amount>'}\``)
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    if (currencyType === 'credits') {
      const result = client.db.transferCredits(message.guild.id, message.author.id, target.id, amount);

      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor('#E74C3C')
          .setTitle('❌ Tip Failed')
          .setDescription(result.error)
          .setFooter({ text: `Requested by ${message.author.tag}` });
        return message.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ Tip Complete')
        .setDescription(`You tipped **${amount.toLocaleString()}** credits to ${target}`)
        .addFields(
          { name: 'Your New Balance', value: `${client.db.getBalance(message.guild.id, message.author.id).toLocaleString()} credits`, inline: true },
          { name: `${target.username}'s New Balance`, value: `${client.db.getBalance(message.guild.id, target.id).toLocaleString()} credits`, inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } else if (currencyType === 'ltc') {
      const userLTC = client.db.getLTC(message.guild.id, message.author.id);
      if (userLTC < amount) {
        const embed = new EmbedBuilder()
          .setColor('#E74C3C')
          .setTitle('❌ Insufficient LTC')
          .setDescription(`You don't have enough LTC! (Balance: ${userLTC.toFixed(4)} Ł)`)
          .setFooter({ text: `Requested by ${message.author.tag}` });
        return message.reply({ embeds: [embed] });
      }

      client.db.addLTC(message.guild.id, message.author.id, -amount);
      client.db.addLTC(message.guild.id, target.id, amount);

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('✅ LTC Transfer Complete')
        .setDescription(`You transferred **${amount.toFixed(4)} Ł** to ${target}`)
        .addFields(
          { name: 'Your New Balance', value: `${client.db.getLTC(message.guild.id, message.author.id).toFixed(4)} Ł`, inline: true },
          { name: `${target.username}'s New Balance`, value: `${client.db.getLTC(message.guild.id, target.id).toFixed(4)} Ł`, inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } else if (currencyType === 'dollar') {
      const userDollars = client.db.getDollars(message.guild.id, message.author.id);
      if (userDollars < amount) {
        const embed = new EmbedBuilder()
          .setColor('#E74C3C')
          .setTitle('❌ Insufficient Dollars')
          .setDescription(`You don't have enough dollars! (Balance: $${userDollars.toFixed(2)})`)
          .setFooter({ text: `Requested by ${message.author.tag}` });
        return message.reply({ embeds: [embed] });
      }

      client.db.addDollars(message.guild.id, message.author.id, -amount);
      client.db.addDollars(message.guild.id, target.id, amount);

      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ Dollar Transfer Complete')
        .setDescription(`You transferred **$${amount.toFixed(2)}** to ${target}`)
        .addFields(
          { name: 'Your New Balance', value: `$${client.db.getDollars(message.guild.id, message.author.id).toFixed(2)}`, inline: true },
          { name: `${target.username}'s New Balance`, value: `$${client.db.getDollars(message.guild.id, target.id).toFixed(2)}`, inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    }
  }
};
