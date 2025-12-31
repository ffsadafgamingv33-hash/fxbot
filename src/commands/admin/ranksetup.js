const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ranksetup',
  aliases: ['rankconfig'],
  description: 'Setup rank rewards and tiers',
  adminOnly: true,
  execute(message, args, client) {
    const action = args[0]?.toLowerCase();
    
    if (!action || !['add', 'remove', 'list', 'setbio'].includes(action)) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Invalid Usage')
        .setDescription('**Rank Setup Commands:**\n' +
          '`+ranksetup add <level> <role_id> <reward_credits>` - Add rank reward\n' +
          '`+ranksetup remove <level>` - Remove rank reward\n' +
          '`+ranksetup list` - List all rank rewards\n' +
          '`+ranksetup setbio <user> <bio>` - Set user bio for profile')
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    const settings = client.db.getGuildSettings(message.guild.id) || {};
    if (!settings.ranks) settings.ranks = [];
    if (!settings.userBios) settings.userBios = {};

    if (action === 'add') {
      const level = parseInt(args[1]);
      const roleId = args[2];
      const credits = parseInt(args[3]);
      
      if (isNaN(level) || !roleId || isNaN(credits)) {
        return message.reply('❌ Usage: `+ranksetup add <level> <role_id> <reward_credits>`');
      }

      settings.ranks = settings.ranks.filter(r => r.level !== level);
      settings.ranks.push({ level, roleId, credits });
      
      client.db.setGuildSettings(message.guild.id, settings);
      
      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ Rank Added')
        .addFields(
          { name: 'Level', value: `${level}`, inline: true },
          { name: 'Role', value: `<@&${roleId}>`, inline: true },
          { name: 'Reward', value: `${credits} credits`, inline: true }
        );
      return message.reply({ embeds: [embed] });
    }

    if (action === 'remove') {
      const level = parseInt(args[1]);
      if (isNaN(level)) return message.reply('❌ Usage: `+ranksetup remove <level>`');
      
      settings.ranks = settings.ranks.filter(r => r.level !== level);
      client.db.setGuildSettings(message.guild.id, settings);
      
      message.reply(`✅ Rank for level ${level} removed!`);
    }

    if (action === 'list') {
      if (!settings.ranks || settings.ranks.length === 0) {
        return message.reply('❌ No rank rewards set up yet.');
      }

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('🏆 Rank Rewards')
        .setDescription(settings.ranks
          .sort((a, b) => a.level - b.level)
          .map(r => `**Level ${r.level}** → <@&${r.roleId}> (+${r.credits} credits)`)
          .join('\n'))
        .setFooter({ text: `Requested by ${message.author.tag}` });
      
      return message.reply({ embeds: [embed] });
    }

    if (action === 'setbio') {
      const target = message.mentions.users.first();
      const bio = args.slice(2).join(' ');
      
      if (!target || !bio) {
        return message.reply('❌ Usage: `+ranksetup setbio <user> <bio>`');
      }
      
      settings.userBios[target.id] = bio;
      client.db.setGuildSettings(message.guild.id, settings);
      
      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('✅ Bio Updated')
        .addFields(
          { name: 'User', value: `${target}`, inline: false },
          { name: 'Bio', value: bio, inline: false }
        );
      
      message.reply({ embeds: [embed] });
    }
  }
};
