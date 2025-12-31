const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'withdraw',
  description: 'Withdraw LTC/Dollars for credits',
  execute(message, args, client) {
    const type = args[0]?.toLowerCase();
    const amount = parseFloat(args[1]);

    if (!type || !['ltc', '$', 'dollar'].includes(type)) {
      return message.reply('❌ Usage: `+withdraw <ltc/$> <amount>`\nRates: 1 Ł = 490,000 credits | $1 = 290,000 credits');
    }

    if (isNaN(amount) || amount <= 0) return message.reply('❌ Please provide a valid amount.');

    let creditReward = 0;
    if (type === 'ltc') {
      const balance = client.db.getLTC(message.guild.id, message.author.id);
      if (balance < amount) return message.reply("❌ Not enough LTC!");
      creditReward = Math.floor(amount * 490000);
      client.db.addLTC(message.guild.id, message.author.id, -amount);
    } else {
      const balance = client.db.getDollars(message.guild.id, message.author.id);
      if (balance < amount) return message.reply("❌ Not enough dollars!");
      creditReward = Math.floor(amount * 290000);
      client.db.addDollars(message.guild.id, message.author.id, -amount);
    }

    client.db.addCredits(message.guild.id, message.author.id, creditReward);

    const embed = new EmbedBuilder()
      .setColor('#E67E22')
      .setTitle('💰 Withdrawal Successful')
      .setDescription(`Withdrew **${amount}** for **${creditReward.toLocaleString()}** credits`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
