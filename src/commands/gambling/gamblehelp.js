const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'gamblehelp',
  description: 'View gambling commands guide',
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#E67E22')
      .setTitle('🎰 Gambling Guide')
      .setDescription('Try your luck with these gambling games!')
      .addFields(
        { name: '+roulette <amount> <color>', value: 'Bet on red, black, or green\n• Red/Black: 2x payout\n• Green: 14x payout', inline: false },
        { name: '+dice <amount>', value: 'Roll dice against the bot\n• Higher roll wins 2x', inline: false },
        { name: '+slots <amount>', value: 'Spin the slot machine\n• 3 matching: 10x\n• 2 matching: 2x', inline: false },
        { name: '+coinflip <amount> <heads/tails>', value: 'Classic coin flip\n• Correct guess: 2x', inline: false },
        { name: '+crash <amount>', value: 'Cash out before it crashes!\n• Multiplier increases over time', inline: false },
        { name: '+gamblestats', value: 'View your gambling statistics', inline: false },
        { name: '+gambletop', value: 'View the gambling leaderboard', inline: false }
      )
      .setFooter({ text: '⚠️ Gamble responsibly!' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
