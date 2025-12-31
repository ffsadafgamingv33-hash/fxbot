const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'crash',
  aliases: ['crush'],
  description: 'Play the crash game',
  cooldown: 30,
  async execute(message, args, client) {
    const amount = parseInt(args[0]);
    
    if (!amount || amount < 1) {
      return message.reply('❌ Please specify an amount! Usage: `+crash <amount>`');
    }
    
    const balance = client.db.getBalance(message.guild.id, message.author.id);
    if (balance < amount) {
      return message.reply(`❌ You don't have enough credits! Your balance: ${balance.toLocaleString()}`);
    }
    
    const crashPoint = Math.random() < 0.02 ? 1.0 : 1 + Math.random() * Math.random() * 10;
    let currentMultiplier = 1.0;
    let crashed = false;
    let cashedOut = false;
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('cashout')
          .setLabel('💰 Cash Out')
          .setStyle(ButtonStyle.Success)
      );
    
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('📈 Crash Game')
      .setDescription(`Bet: **${amount.toLocaleString()}** credits\n\n**Multiplier: ${currentMultiplier.toFixed(2)}x**\n\nClick "Cash Out" before it crashes!`)
      .setFooter({ text: 'The multiplier is rising...' });
    
    const gameMessage = await message.reply({ embeds: [embed], components: [row] });
    
    const collector = gameMessage.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 30000
    });
    
    collector.on('collect', async i => {
      if (i.customId === 'cashout' && !crashed && !cashedOut) {
        cashedOut = true;
        const winnings = Math.floor(amount * currentMultiplier);
        client.db.addCredits(message.guild.id, message.author.id, winnings - amount);
        client.db.updateGambleStats(message.guild.id, message.author.id, amount, winnings);
        const newBalance = client.db.getBalance(message.guild.id, message.author.id);
        
        const winEmbed = new EmbedBuilder()
          .setColor('#2ECC71')
          .setTitle('📈 Crash Game - Cashed Out!')
          .setDescription(`You cashed out at **${currentMultiplier.toFixed(2)}x**!`)
          .addFields(
            { name: 'Winnings', value: `+${winnings.toLocaleString()} credits`, inline: true },
            { name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true }
          )
          .setTimestamp();
        
        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      }
    });
    
    const interval = setInterval(async () => {
      if (cashedOut) {
        clearInterval(interval);
        return;
      }
      
      currentMultiplier += 0.1 + Math.random() * 0.2;
      
      if (currentMultiplier >= crashPoint) {
        crashed = true;
        clearInterval(interval);
        client.db.removeCredits(message.guild.id, message.author.id, amount);
        client.db.updateGambleStats(message.guild.id, message.author.id, amount, 0);
        const newBalance = client.db.getBalance(message.guild.id, message.author.id);
        
        const crashEmbed = new EmbedBuilder()
          .setColor('#E74C3C')
          .setTitle('📉 Crash Game - CRASHED!')
          .setDescription(`The game crashed at **${crashPoint.toFixed(2)}x**!`)
          .addFields(
            { name: 'You Lost', value: `-${amount.toLocaleString()} credits`, inline: true },
            { name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true }
          )
          .setTimestamp();
        
        await gameMessage.edit({ embeds: [crashEmbed], components: [] }).catch(() => {});
        collector.stop();
        return;
      }
      
      const updateEmbed = new EmbedBuilder()
        .setColor('#F1C40F')
        .setTitle('📈 Crash Game')
        .setDescription(`Bet: **${amount.toLocaleString()}** credits\n\n**Multiplier: ${currentMultiplier.toFixed(2)}x**\n\nClick "Cash Out" before it crashes!`)
        .setFooter({ text: 'The multiplier is rising...' });
      
      await gameMessage.edit({ embeds: [updateEmbed], components: [row] }).catch(() => {});
    }, 1000);
    
    collector.on('end', () => {
      clearInterval(interval);
    });
  }
};
