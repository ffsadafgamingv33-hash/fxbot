const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coinflip',
  aliases: ['cf', 'flip'],
  description: 'Flip a coin',
  cooldown: 5,
  async execute(message, args, client) {
    const amount = parseInt(args[0]);
    const choice = args[1]?.toLowerCase();
    
    if (!amount || amount < 1) {
      return message.reply('❌ Please specify an amount! Usage: `+coinflip <amount> <heads/tails>`');
    }
    
    if (!['heads', 'tails', 'h', 't'].includes(choice)) {
      return message.reply('❌ Please choose `heads` or `tails`');
    }
    
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    if (balance < amount) {
      return message.reply(`❌ You don't have enough credits! Your balance: ${balance.toLocaleString()}`);
    }
    
    const msg = await message.reply('🪙 Flipping...');
    
    let iterations = 0;
    const interval = setInterval(async () => {
      iterations++;
      if (iterations >= 3) {
        clearInterval(interval);
        
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const playerChoice = choice === 'h' ? 'heads' : choice === 't' ? 'tails' : choice;
        const won = result === playerChoice;
        
        let winnings = 0;
        if (won) {
          winnings = amount * 2;
          client.db.addCredits(message.guild.id, message.author.id, amount);
        } else {
          client.db.removeCredits(message.guild.id, message.author.id, amount);
        }
        
        client.db.updateGambleStats(message.guild.id, message.author.id, amount, winnings);
        const newBalance = client.db.getBalance(message.guild.id, message.author.id);
        
        const coinEmoji = result === 'heads' ? '🪙' : '🔵';
        
        const embed = new EmbedBuilder()
          .setColor(won ? '#2ECC71' : '#E74C3C')
          .setTitle('🪙 Coin Flip')
          .setDescription(`The coin landed on **${coinEmoji} ${result.toUpperCase()}**!`)
          .addFields(
            { name: 'Your Choice', value: playerChoice.toUpperCase(), inline: true },
            { name: won ? '🎉 You Won!' : '💔 You Lost!', value: won ? `+${winnings.toLocaleString()} credits` : `-${amount.toLocaleString()} credits`, inline: true },
            { name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true }
          )
          .setTimestamp();
        
        msg.edit({ content: null, embeds: [embed] });
      } else {
        msg.edit(iterations % 2 === 0 ? '🪙 Flipping... HEADS' : '🔵 Flipping... TAILS');
      }
    }, 500);
  }
};
