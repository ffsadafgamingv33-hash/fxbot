const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'mine',
  aliases: ['mining', 'dig'],
  description: 'Mine for credits and resources',
  cooldown: 30,
  async execute(message, args, client) {
    const user = client.db.getUser(message.guild.id, message.author.id);
    
    const mineTypes = [
      { name: 'Coal', emoji: '⬛', minReward: 50, maxReward: 150 },
      { name: 'Iron', emoji: '🟫', minReward: 100, maxReward: 300 },
      { name: 'Gold', emoji: '🟨', minReward: 250, maxReward: 500 },
      { name: 'Diamond', emoji: '🔵', minReward: 500, maxReward: 1000 }
    ];
    
    const randomMine = mineTypes[Math.floor(Math.random() * mineTypes.length)];
    const reward = Math.floor(Math.random() * (randomMine.maxReward - randomMine.minReward + 1)) + randomMine.minReward;
    
    client.db.addCredits(message.guild.id, message.author.id, reward);
    const newBalance = client.db.getBalance(message.guild.id, message.author.id);
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('⛏️ Mining Game')
      .setDescription(`${message.author} swung the pickaxe...\n\n${randomMine.emoji} **${randomMine.name}** found!`)
      .addFields(
        { name: '💰 Reward', value: `+${reward.toLocaleString()} credits`, inline: true },
        { name: '💵 New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true }
      )
      .setFooter({ text: `⏱️ Cooldown: 30 seconds` })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`mine_again_${message.author.id}`)
          .setLabel('Mine Again')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⛏️')
      );
    
    const gameMessage = await message.reply({ embeds: [embed], components: [row] });
    
    const collector = gameMessage.createMessageComponentCollector({
      filter: i => i.customId === `mine_again_${message.author.id}` && i.user.id === message.author.id,
      time: 60000
    });
    
    collector.on('collect', async i => {
      await i.defer();
      
      const userCooldown = client.cooldowns.get(`mine_${message.author.id}`);
      if (userCooldown && Date.now() < userCooldown) {
        return i.followUp({ content: `⏰ You need to wait before mining again!`, ephemeral: true });
      }
      
      const nextMine = mineTypes[Math.floor(Math.random() * mineTypes.length)];
      const nextReward = Math.floor(Math.random() * (nextMine.maxReward - nextMine.minReward + 1)) + nextMine.minReward;
      
      client.db.addCredits(message.guild.id, message.author.id, nextReward);
      const updatedBalance = client.db.getBalance(message.guild.id, message.author.id);
      
      const newEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('⛏️ Mining Game')
        .setDescription(`${message.author} swung the pickaxe...\n\n${nextMine.emoji} **${nextMine.name}** found!`)
        .addFields(
          { name: '💰 Reward', value: `+${nextReward.toLocaleString()} credits`, inline: true },
          { name: '💵 New Balance', value: `${updatedBalance.toLocaleString()} credits`, inline: true }
        )
        .setFooter({ text: `⏱️ Cooldown: 30 seconds` })
        .setTimestamp();
      
      client.cooldowns.set(`mine_${message.author.id}`, Date.now() + 30000);
      setTimeout(() => client.cooldowns.delete(`mine_${message.author.id}`), 30000);
      
      await gameMessage.edit({ embeds: [newEmbed], components: [row] });
    });
  }
};
