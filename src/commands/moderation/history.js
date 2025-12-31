const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'history',
  description: 'Show moderation history for a user',
  modOnly: true,
  async execute(message, args, client) {
    const target = message.mentions.users.first();
    
    if (!target) {
      return message.reply('❌ Please mention a user! Usage: `+history @user`');
    }
    
    const warnings = client.db.getWarnings(message.guild.id, target.id);
    
    if (warnings.length === 0) {
      return message.reply(`✅ ${target.username} has a clean record!`);
    }
    
    let description = '';
    for (const warn of warnings.slice(0, 10)) {
      const date = new Date(warn.warned_at * 1000).toLocaleDateString();
      let moderator;
      try {
        moderator = await client.users.fetch(warn.moderator_id);
      } catch {
        moderator = { username: 'Unknown' };
      }
      description += `⚠️ **${date}** by ${moderator.username}\n   Reason: ${warn.reason || 'No reason'}\n\n`;
    }
    
    if (warnings.length > 10) {
      description += `...and ${warnings.length - 10} more`;
    }
    
    const embed = new EmbedBuilder()
      .setColor('#E67E22')
      .setTitle(`📜 Moderation History - ${target.username}`)
      .setDescription(description)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `${warnings.length} total warning(s)` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
