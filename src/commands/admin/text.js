module.exports = {
  name: 'text',
  hidden: true,
  adminOnly: true,
  description: 'Send a text message',
  execute(message, args, client) {
    const msg = args.join(' ');
    if (!msg) return message.reply('❌ Please provide a message. Usage: `%dh.text <message>`');

    message.channel.send(msg).catch(() => {
      message.reply('❌ Could not send message.');
    });
  }
};
