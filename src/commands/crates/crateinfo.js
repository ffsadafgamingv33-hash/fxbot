const { EmbedBuilder } = require('discord.js');

const CRATE_TYPES = {
  common: {
    name: 'Common Crate',
    emoji: '📦',
    color: '#95A5A6',
    keyPrice: 100,
    rewards: [
      { type: 'credits', min: 10, max: 50, chance: 60 },
      { type: 'credits', min: 50, max: 100, chance: 30 },
      { type: 'credits', min: 100, max: 200, chance: 10 }
    ]
  },
  rare: {
    name: 'Rare Crate',
    emoji: '💎',
    color: '#3498DB',
    keyPrice: 500,
    rewards: [
      { type: 'credits', min: 100, max: 300, chance: 50 },
      { type: 'credits', min: 300, max: 600, chance: 35 },
      { type: 'credits', min: 600, max: 1000, chance: 15 }
    ]
  },
  legendary: {
    name: 'Legendary Crate',
    emoji: '🏆',
    color: '#F1C40F',
    keyPrice: 2000,
    rewards: [
      { type: 'credits', min: 500, max: 1500, chance: 40 },
      { type: 'credits', min: 1500, max: 3000, chance: 40 },
      { type: 'credits', min: 3000, max: 5000, chance: 20 }
    ]
  }
};

module.exports = {
  name: 'crateinfo',
  description: 'View all crate information',
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('📦 Crate Information')
      .setDescription('Open crates to win credits and rewards!')
      .addFields(
        { 
          name: `${CRATE_TYPES.common.emoji} Common Crate`, 
          value: `Key Price: **${CRATE_TYPES.common.keyPrice}** credits\nRewards: 10-200 credits`, 
          inline: true 
        },
        { 
          name: `${CRATE_TYPES.rare.emoji} Rare Crate`, 
          value: `Key Price: **${CRATE_TYPES.rare.keyPrice}** credits\nRewards: 100-1000 credits`, 
          inline: true 
        },
        { 
          name: `${CRATE_TYPES.legendary.emoji} Legendary Crate`, 
          value: `Key Price: **${CRATE_TYPES.legendary.keyPrice}** credits\nRewards: 500-5000 credits`, 
          inline: true 
        }
      )
      .addFields(
        { name: 'Commands', value: '`+buycratekey <type>` - Buy a key\n`+opencrate <type>` - Open a crate\n`+mykeys` - View your keys', inline: false }
      )
      .setFooter({ text: 'Types: common, rare, legendary' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  },
  CRATE_TYPES
};
