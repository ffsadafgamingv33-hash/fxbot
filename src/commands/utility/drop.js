const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'drop',
  description: 'Drop items for users to claim',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) return message.reply('❌ Admin only');
    
    const isInteraction = !!message.isChatInputCommand;
    const count = parseInt(args[0]);
    const prize = args.slice(1).join(' ');
    
    if (isNaN(count) || count <= 0 || !prize) {
      return message.reply('❌ Usage: `+drop <how_many_claim> <what_drop>`');
    }

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('📦 A Drop has appeared!')
      .setDescription(`The first **${count}** people to click the button below will get: **${prize}**`)
      .setTimestamp();

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('claim_drop')
          .setLabel('Claim Drop!')
          .setStyle(ButtonStyle.Primary),
      );

    const msg = isInteraction 
      ? await message.reply({ embeds: [embed], components: [row], fetchReply: true })
      : await message.channel.send({ embeds: [embed], components: [row] });
    
    const claimed = new Set();
    const collector = msg.createMessageComponentCollector({ time: 3600000 });

    collector.on('collect', async i => {
      if (claimed.has(i.user.id)) return i.reply({ content: '❌ You already claimed this!', ephemeral: true });
      if (claimed.size >= count) return i.reply({ content: '❌ All drops claimed!', ephemeral: true });

      claimed.add(i.user.id);
      
      try {
        await i.user.send(`🎁 You claimed a drop: **${prize}**`);
        await i.reply({ content: '✅ Check your DMs!', ephemeral: true });
      } catch (err) {
        await i.reply({ content: '❌ Could not DM you!', ephemeral: true });
      }

      if (claimed.size >= count) {
        embed.setTitle('📦 Drop Ended').setDescription('All drops have been claimed!');
        await msg.edit({ embeds: [embed], components: [] });
        collector.stop();
      }
    });
  }
};