const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'addinvites',
  description: 'Add invites to a user (Owner only)',
  ownerOnly: true,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    
    if (!target || !amount || amount < 1) {
      return message.reply('❌ Usage: `+addinvites @user <amount>`');
    }
    
    for (let i = 0; i < amount; i++) {
      client.db.addInvite(message.guild.id, target.id, 'manual', 'manual');
    }
    
    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Invites Added')
      .setDescription(`Added **${amount}** invites to ${target}`)
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
