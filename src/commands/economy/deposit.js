const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'deposit',
  description: 'Deposit credits for LTC/Dollars',
  execute(message, args, client) {
    const type = args[0]?.toLowerCase(); // ltc or dollar
    const creditAmount = parseInt(args[1]);

    if (!type || !['ltc', '$', 'dollar', 'fire'].includes(type)) {
      return message.reply('❌ Usage: `+deposit <ltc/$/fire> <credit_amount>`\nRates: 500,000 credits = 1 Ł | 300,000 credits = $1 | 1,000,000 = 🔥');
    }

    if (isNaN(creditAmount) || creditAmount <= 0) return message.reply('❌ Please provide a valid credit amount.');

    const balance = client.db.getBalance(message.guild.id, message.author.id);
    if (balance < creditAmount) return message.reply("❌ You don't have enough credits!");

    let rewardAmount = 0;
    let rewardSymbol = '';
    
    if (type === 'ltc') {
      rewardAmount = creditAmount / 500000;
      rewardSymbol = 'Ł';
      client.db.addLTC(message.guild.id, message.author.id, rewardAmount);
    } else if (type === 'fire') {
      rewardAmount = creditAmount / 1000000; // 1,000,000 credits per witch fire
      rewardSymbol = '🔥';
      // client.db.addFire(message.guild.id, message.author.id, rewardAmount); // Assuming a fire currency exists or just logging it
    } else {
      rewardAmount = creditAmount / 300000;
      rewardSymbol = '$';
      client.db.addDollars(message.guild.id, message.author.id, rewardAmount);
    }

    client.db.removeCredits(message.guild.id, message.author.id, creditAmount);

    const embed = new EmbedBuilder()
      .setColor('#E67E22')
      .setTitle('🔥 Deposit to Witch Fire')
      .setDescription(`Successfully sacrificed **${creditAmount.toLocaleString()}** credits for **${rewardAmount.toFixed(2)} ${rewardSymbol} Witch Fire**`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
