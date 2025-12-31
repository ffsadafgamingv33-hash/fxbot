const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roulette',
  description: 'Play roulette',
  cooldown: 5,
  async execute(message, args, client) {
    const amount = parseInt(args[0]);
    const color = args[1]?.toLowerCase();
    
    if (!amount || amount < 1) {
      return message.reply('❌ Please specify an amount! Usage: `+roulette <amount> <red/black/green>`');
    }
    
    if (!['red', 'black', 'green'].includes(color)) {
      return message.reply('❌ Please choose a color: `red`, `black`, or `green`');
    }
    
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    if (balance < amount) {
      return message.reply(`❌ You don't have enough credits! Your balance: ${balance.toLocaleString()}`);
    }
    
    const number = Math.floor(Math.random() * 37);
    let resultColor;
    if (number === 0) {
      resultColor = 'green';
    } else if (number % 2 === 0) {
      resultColor = 'red';
    } else {
      resultColor = 'black';
    }
    
    const colorEmoji = { red: '🔴', black: '⚫', green: '🟢' };
    let winnings = 0;
    let won = false;
    
    if (color === resultColor) {
      won = true;
      if (color === 'green') {
        winnings = amount * 14;
      } else {
        winnings = amount * 2;
      }
      client.db.addCredits(message.guild.id, message.author.id, winnings - amount);
    } else {
      client.db.removeCredits(message.guild.id, message.author.id, amount);
    }
    
    client.db.updateGambleStats(message.guild.id, message.author.id, amount, winnings);
    const newBalance = client.db.getBalance(message.guild.id, message.author.id);
    
    const embed = new EmbedBuilder()
      .setColor(won ? '#2ECC71' : '#E74C3C')
      .setTitle('🎰 Roulette')
      .setDescription(`The ball landed on **${number}** ${colorEmoji[resultColor]} ${resultColor.toUpperCase()}`)
      .addFields(
        { name: 'Your Bet', value: `${colorEmoji[color]} ${color.toUpperCase()} - ${amount.toLocaleString()} credits`, inline: true },
        { name: won ? '🎉 You Won!' : '💔 You Lost!', value: won ? `+${winnings.toLocaleString()} credits` : `-${amount.toLocaleString()} credits`, inline: true },
        { name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true }
      )
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
