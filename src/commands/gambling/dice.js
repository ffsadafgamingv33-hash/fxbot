const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dice',
  description: 'Roll dice against the bot',
  cooldown: 5,
  execute(message, args, client) {
    const amount = parseInt(args[0]);
    
    if (!amount || amount < 1) {
      return message.reply('❌ Please specify an amount! Usage: `+dice <amount>`');
    }
    
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    if (balance < amount) {
      return message.reply(`❌ You don't have enough credits! Your balance: ${balance.toLocaleString()}`);
    }
    
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;
    
    let won = false;
    let winnings = 0;
    let result = '';
    
    if (playerRoll > botRoll) {
      won = true;
      winnings = amount * 2;
      result = '🎉 You Won!';
      client.db.addCredits(message.guild.id, message.author.id, amount);
    } else if (playerRoll < botRoll) {
      result = '💔 You Lost!';
      client.db.removeCredits(message.guild.id, message.author.id, amount);
    } else {
      result = '🤝 Tie! Your bet was returned.';
      winnings = amount;
    }
    
    client.db.updateGambleStats(message.guild.id, message.author.id, amount, winnings);
    const newBalance = client.db.getBalance(message.guild.id, message.author.id);
    
    const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    const embed = new EmbedBuilder()
      .setColor(won ? '#2ECC71' : playerRoll === botRoll ? '#F1C40F' : '#E74C3C')
      .setTitle('🎲 Dice Roll')
      .addFields(
        { name: 'Your Roll', value: `${diceEmoji[playerRoll - 1]} **${playerRoll}**`, inline: true },
        { name: 'Bot Roll', value: `${diceEmoji[botRoll - 1]} **${botRoll}**`, inline: true },
        { name: result, value: won ? `+${winnings.toLocaleString()} credits` : playerRoll === botRoll ? 'No change' : `-${amount.toLocaleString()} credits`, inline: false },
        { name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true }
      )
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
