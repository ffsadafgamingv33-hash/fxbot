const { EmbedBuilder } = require('discord.js');
const { CRATE_TYPES } = require('./crateinfo');

module.exports = {
  name: 'opencrate',
  description: 'Open a crate',
  cooldown: 5,
  execute(message, args, client) {
    const type = args[0]?.toLowerCase();
    
    if (!type || !CRATE_TYPES[type]) {
      return message.reply('❌ Invalid crate type! Types: `common`, `rare`, `legendary`');
    }
    
    const hasKey = client.db.useCrateKey(message.guild.id, message.author.id, type);
    
    if (!hasKey) {
      return message.reply(`❌ You don't have a ${type} crate key! Use \`+buycratekey ${type}\` to buy one.`);
    }
    
    const crate = CRATE_TYPES[type];
    
    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    let selectedReward = crate.rewards[0];
    
    for (const reward of crate.rewards) {
      cumulativeChance += reward.chance;
      if (roll <= cumulativeChance) {
        selectedReward = reward;
        break;
      }
    }
    
    const creditReward = Math.floor(Math.random() * (selectedReward.max - selectedReward.min + 1)) + selectedReward.min;
    client.db.addCredits(message.guild.id, message.author.id, creditReward);
    
    const newBalance = client.db.getBalance(message.guild.id, message.author.id);
    
    const embed = new EmbedBuilder()
      .setColor(crate.color)
      .setTitle(`${crate.emoji} ${crate.name} Opened!`)
      .setDescription(`🎉 You won **${creditReward.toLocaleString()}** credits!`)
      .addFields({ name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true })
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
