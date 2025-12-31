const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'invited',
  description: 'View members you invited',
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const invited = client.db.getInvited(message.guild.id, target.id);
    
    if (invited.length === 0) {
      return message.reply(`❌ ${target.id === message.author.id ? 'You haven\'t' : `${target.username} hasn't`} invited anyone yet!`);
    }
    
    let description = '';
    for (const inv of invited.slice(0, 20)) {
      try {
        const member = await client.users.fetch(inv.invited_id);
        const status = inv.valid ? '✅' : '❌';
        const date = new Date(inv.invited_at * 1000).toLocaleDateString();
        description += `${status} **${member.username}** - ${date}\n`;
      } catch {
        description += `❌ Unknown User - Left\n`;
      }
    }
    
    if (invited.length > 20) {
      description += `\n...and ${invited.length - 20} more`;
    }
    
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle(`📨 Members Invited by ${target.username}`)
      .setDescription(description)
      .setFooter({ text: `${invited.length} total invites` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
