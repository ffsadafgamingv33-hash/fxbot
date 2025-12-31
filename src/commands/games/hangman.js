const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const words = [
  'DISCORD', 'HANGMAN', 'JAVASCRIPT', 'DATABASE', 'DEVELOPER',
  'GAMING', 'STREAMER', 'COMMUNITY', 'SERVER', 'MEMBER',
  'CRYPTOCURRENCY', 'BITCOIN', 'ETHEREUM', 'FANTASY', 'ADVENTURE'
];

module.exports = {
  name: 'hangman',
  description: 'Play Hangman game',
  cooldown: 10,
  async execute(message, args, client) {
    const word = words[Math.floor(Math.random() * words.length)];
    const guessed = new Set();
    const wrong = new Set();
    let gameOver = false;
    let won = false;
    
    const getDisplay = () => {
      return word.split('').map(letter => guessed.has(letter) ? letter : '_').join(' ');
    };
    
    const getButtons = () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const rows = [];
      
      for (let i = 0; i < letters.length; i += 6) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 6 && i + j < letters.length; j++) {
          const letter = letters[i + j];
          const isGuessed = guessed.has(letter) || wrong.has(letter);
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`hangman_${letter}`)
              .setLabel(letter)
              .setStyle(guessed.has(letter) ? ButtonStyle.Success : wrong.has(letter) ? ButtonStyle.Danger : ButtonStyle.Primary)
              .setDisabled(isGuessed || gameOver)
          );
        }
        rows.push(row);
      }
      return rows;
    };
    
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🎮 Hangman Game')
      .setDescription(`**Word:** ${getDisplay()}\n\n**Wrong Guesses:** ${wrong.size}/6\n**Letters:** ${[...wrong].join(', ') || 'None'}`)
      .setFooter({ text: `Guessed: ${guessed.size}` });
    
    const gameMessage = await message.reply({ embeds: [embed], components: getButtons() });
    
    const collector = gameMessage.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 300000
    });
    
    collector.on('collect', async i => {
      const letter = i.customId.split('_')[1];
      
      if (word.includes(letter)) {
        guessed.add(letter);
      } else {
        wrong.add(letter);
      }
      
      if (wrong.size >= 6) {
        gameOver = true;
        const finalEmbed = new EmbedBuilder()
          .setColor('#E74C3C')
          .setTitle('💀 Game Over!')
          .setDescription(`You lost! The word was: **${word}**`)
          .setFooter({ text: `Wrong guesses: ${wrong.size}/6` });
        
        await i.update({ embeds: [finalEmbed], components: [] });
        collector.stop();
        return;
      }
      
      if ([...word].every(l => guessed.has(l))) {
        gameOver = true;
        won = true;
        const reward = 50;
        client.db.addCredits(message.guild.id, message.author.id, reward);
        const newBalance = client.db.getBalance(message.guild.id, message.author.id);
        
        const finalEmbed = new EmbedBuilder()
          .setColor('#2ECC71')
          .setTitle('🎉 You Won!')
          .setDescription(`The word was: **${word}**\n\n+${reward} credits!`)
          .addFields({ name: 'New Balance', value: `${newBalance.toLocaleString()} credits`, inline: true });
        
        await i.update({ embeds: [finalEmbed], components: [] });
        collector.stop();
        return;
      }
      
      const updatedEmbed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🎮 Hangman Game')
        .setDescription(`**Word:** ${getDisplay()}\n\n**Wrong Guesses:** ${wrong.size}/6\n**Letters:** ${[...wrong].join(', ') || 'None'}`)
        .setFooter({ text: `Guessed: ${guessed.size}` });
      
      await i.update({ embeds: [updatedEmbed], components: getButtons() });
    });
    
    collector.on('end', () => {
      if (!gameOver) {
        message.reply(`⏰ Hangman game ended! The word was: **${word}**`);
      }
    });
  }
};
