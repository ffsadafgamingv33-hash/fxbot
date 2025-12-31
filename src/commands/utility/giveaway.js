const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'gwy',
  aliases: ['giveaway'],
  description: 'Start a giveaway',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) return message.reply('❌ Admin only');
    
    const isInteraction = !!message.isChatInputCommand;
    const winnersCount = parseInt(args[0]);
    const timeStr = args[1];
    const prizeName = args[2];
    const prizeActual = args.slice(3).join(' ');

    if (isNaN(winnersCount) || !timeStr || !prizeName || !prizeActual) {
      return message.reply('❌ Usage: `+gwy <winner_number> <time> <prize_name> <prize>`');
    }

    // Simple time parser
    let duration = parseInt(timeStr);
    if (timeStr.endsWith('h')) duration *= 3600000;
    else if (timeStr.endsWith('m')) duration *= 60000;
    else if (timeStr.endsWith('s')) duration *= 1000;
    else duration *= 60000; // default minutes

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 GIVEAWAY STARTED')
      .setDescription(`Prize: **${prizeName}**\nWinners: **${winnersCount}**\nEnds in: **${timeStr}**\nReact with 🎉 to enter!`)
      .setTimestamp();

    const msg = isInteraction
      ? await message.reply({ embeds: [embed], fetchReply: true })
      : await message.channel.send({ embeds: [embed] });
    
    await msg.react('🎉');

    setTimeout(async () => {
      const reactions = await msg.reactions.cache.get('🎉').users.fetch();
      const users = reactions.filter(u => !u.bot).map(u => u);
      
      if (users.length === 0) return message.channel.send('❌ No one entered the giveaway.');

      const winners = [];
      for (let i = 0; i < winnersCount && users.length > 0; i++) {
        const index = Math.floor(Math.random() * users.length);
        winners.push(users.splice(index, 1)[0]);
      }

      message.channel.send(`🎉 Congratulations ${winners.join(', ')}! You won **${prizeName}**!`);
      
      winners.forEach(w => {
        w.send(`🎁 You won a giveaway: **${prizeName}**\nPrize: ${prizeActual}`).catch(() => {});
      });

      embed.setTitle('🎉 GIVEAWAY ENDED').setDescription(`Winners: ${winners.join(', ')}`);
      msg.edit({ embeds: [embed] });
    }, duration);
  }
};