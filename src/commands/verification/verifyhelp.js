const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'verifyhelp',
  description: 'Verification guide',
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('🛡️ Verification Guide')
      .setDescription('Welcome to the verification system!')
      .addFields(
        { name: 'How to Verify', value: '1. Complete the captcha when prompted\n2. Solve the verification challenge\n3. Get access to the server!', inline: false },
        { name: 'Bonus', value: 'Solving captchas earns you bonus credits!', inline: false },
        { name: 'Commands', value: '`+captchastatus` - Check your verification status', inline: false }
      )
      .setFooter({ text: 'Contact a moderator if you have issues' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
