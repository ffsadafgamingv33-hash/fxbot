module.exports = {
  name: 'shopsetup',
  execute(message, args) {
    const db = require('quick.db');

    if (args[0] === 'remove.xyz') {
      db.delete(`shop_${message.guild.id}`);
      return message.reply('🗑️ Shop items have removed');
    }
  }
};