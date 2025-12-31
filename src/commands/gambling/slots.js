const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'slots',
  description: 'Play the slot machine',
  cooldown: 5,
  async execute(message, args, client) {
    const amount = parseInt(args[0]);
    
    if (!amount || amount < 1) {
      return message.reply('❌ Please specify an amount! Usage: `+slots <amount>`');
    }
    
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    if (balance < amount) {
      return message.reply(`❌ You don't have enough credits! Your balance: ${balance.toLocaleString()}`);
    }
    
    const msg = await message.reply('🎰 **[ 🎰 | 🎰 | 🎰 ]**');
    
    let iterations = 0;
    const interval = setInterval(async () => {
      iterations++;
      if (iterations >= 5) {
        clearInterval(interval);
        
        const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐'];
        const weights = [25, 20, 18, 15, 10, 7, 5];
        
        function getSymbol() {
          const total = weights.reduce((a, b) => a + b, 0);
          let random = Math.random() * total;
          for (let i = 0; i < symbols.length; i++) {
            if (random < weights[i]) return symbols[i];
            random -= weights[i];
          }
          return symbols[0];
        }
        
        const result = [getSymbol(), getSymbol(), getSymbol()];
        
        let multiplier = 0;
        let won = false;
        
        if (result[0] === result[1] && result[1] === result[2]) {
          won = true;
          if (result[0] === '7️⃣') multiplier = 50;
          else if (result[0] === '💎') multiplier = 25;
          else if (result[0] === '⭐') multiplier = 15;
          else multiplier = 10;
        } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
          won = true;
          multiplier = 2;
        }
        
        let winnings = 0;
        if (won) {
          winnings = amount * multiplier;
          client.db.addCredits(message.guild.id, message.author.id, winnings - amount);
        } else {
          client.db.removeCredits(message.guild.id, message.author.id, amount);
        }
        
        client.db.updateGambleStats(message.guild.id, message.author.id, amount, winnings);
        const newBalance = client.db.getBalance(message.guild.id, message.author.id);
        
        const embed = new EmbedBuilder()
          .setColor(won ? '#2ECC71' : '#E74C3C')
          .setTitle('🎰 Slot Machine')
          .setDescription(`**[ ${result.join(' | ')} ]**`)
          .addFields(
            { name: won ? '🎉 Winner!' : '💔 No Match', value: won ? `${multiplier}x - +${winnings.toLocaleString()} credits` : `-${amount.toLocaleString()} credits`, inline: true },
            { name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true }
          )
          .setFooter({ text: '3 matching = 10x+ | 2 matching = 2x' })
          .setTimestamp();
        
        msg.edit({ content: null, embeds: [embed] });
      } else {
        const temp = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐'];
        const r = () => temp[Math.floor(Math.random() * temp.length)];
        msg.edit(`🎰 **[ ${r()} | ${r()} | ${r()} ]**`);
      }
    }, 500);
  }
};