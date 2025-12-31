const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'uwu',
  aliases: ['owo', 'kawaii'],
  description: 'Get an uwu message for yourself or another user',
  execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const uwuResponses = [
      `*pounces on ${target}* owo what's this?`,
      `${target} is so kawaii! >///<`,
      `*nuzzles* uwu ${target} so nice!`,
      `${target} ➜ (´｀ 【ツ】 ´｀)`,
      `UwU ${target} looks purrfect today!`,
      `*glomps ${target}* nya~!`,
      `${target} is the cutest! ✨uwu✨`,
      `rawr, ${target} XD`
    ];
    
    const response = uwuResponses[Math.floor(Math.random() * uwuResponses.length)];
    
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setDescription(response)
      .setThumbnail(target.displayAvatarURL());
    
    message.reply({ embeds: [embed] });
  }
};
