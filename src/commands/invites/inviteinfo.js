const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'inviteinfo',
  description: 'Get info on an invite code',
  async execute(message, args, client) {
    const code = args[0];
    
    if (!code) {
      return message.reply('❌ Please specify an invite code! Usage: `+inviteinfo <code>`');
    }
    
    try {
      const invite = await client.fetchInvite(code);
      
      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('📨 Invite Information')
        .addFields(
          { name: 'Code', value: invite.code, inline: true },
          { name: 'Inviter', value: invite.inviter?.tag || 'Unknown', inline: true },
          { name: 'Uses', value: `${invite.uses || 0}`, inline: true },
          { name: 'Max Uses', value: invite.maxUses === 0 ? 'Unlimited' : `${invite.maxUses}`, inline: true },
          { name: 'Channel', value: invite.channel?.name || 'Unknown', inline: true },
          { name: 'Expires', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>` : 'Never', inline: true }
        )
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch {
      message.reply('❌ Could not find that invite code!');
    }
  }
};
