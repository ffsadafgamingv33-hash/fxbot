const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'mykeys',
  description: 'View your crate keys',
  execute(message, args, client) {
    const keys = client.db.getCrateKeys(message.guild.id, message.author.id);
    
    let description = '';
    if (keys.length === 0) {
      description = 'You don\'t have any crate keys!\nUse `+buycratekey <type>` to purchase keys.';
    } else {
      for (const key of keys) {
        const emoji = key.crate_type === 'common' ? '📦' : key.crate_type === 'rare' ? '💎' : '🏆';
        description += `${emoji} **${key.crate_type.charAt(0).toUpperCase() + key.crate_type.slice(1)}** - ${key.amount} key(s)\n`;
      }
    }
    
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🔑 Your Crate Keys')
      .setDescription(description)
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter({ text: 'Use +opencrate <type> to open a crate' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
