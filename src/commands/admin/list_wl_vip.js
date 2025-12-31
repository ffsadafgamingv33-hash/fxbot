const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'list_wl_vip',
  description: 'List VIP whitelist (Admin only)',
  adminOnly: true,
  async execute(message, args, client) {
    const vipList = client.db.getVIPWhitelist(message.guild.id);
    
    if (vipList.length === 0) {
      return message.reply('❌ No users in the VIP whitelist!');
    }
    
    let description = '';
    for (const vip of vipList) {
      try {
        const user = await client.users.fetch(vip.user_id);
        const date = new Date(vip.added_at * 1000).toLocaleDateString();
        description += `⭐ **${user.username}** - Added: ${date}\n`;
      } catch {
        description += `⭐ Unknown User (${vip.user_id})\n`;
      }
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('⭐ VIP Whitelist')
      .setDescription(description)
      .setFooter({ text: `${vipList.length} VIP user(s)` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
