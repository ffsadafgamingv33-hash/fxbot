const { Client, GatewayIntentBits, Collection, Partials, EmbedBuilder } = require('discord.js');
const Database = require('./database/db');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.db = new Database();

// Load redeem codes
const redeemCodes = require('./redeem_codes.json');
client.db.initializeRedeemCodes(redeemCodes);

const PREFIXES = ['+', '/', '%'];
const ADMIN_ROLE_ID = '1434201704253100095';
const OWNER_ID = '1434201654906847313';

// Load commands from all command folders
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.name) {
      client.commands.set(command.name, command);
      if (command.aliases) {
        command.aliases.forEach(alias => client.commands.set(alias, command));
      }
    }
  }
}

// Track invites
client.invites = new Collection();

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  // Cache invites for all guilds
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      client.invites.set(guild.id, new Collection(invites.map(inv => [inv.code, inv.uses])));
    } catch (err) {
      console.log(`Could not fetch invites for ${guild.name}`);
    }
  }
  
  client.user.setActivity('+help | Ɗʀᴇᴀᴍ ୨୧ 卄ᴀɴɢᴏᴜᴛᴢ', { type: 3 });
});

// Handle new members for invite tracking
client.on('guildMemberAdd', async member => {
  try {
    const cachedInvites = client.invites.get(member.guild.id);
    const newInvites = await member.guild.invites.fetch();
    
    const usedInvite = newInvites.find(inv => {
      const cachedUses = cachedInvites?.get(inv.code) || 0;
      return inv.uses > cachedUses;
    });
    
    if (usedInvite) {
      client.db.addInvite(member.guild.id, usedInvite.inviterId, member.id, usedInvite.code);
    }
    
    client.invites.set(member.guild.id, new Collection(newInvites.map(inv => [inv.code, inv.uses])));
  } catch (err) {
    console.error('Error tracking invite:', err);
  }
});

// XP and message handling
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  
  // Award XP for chatting (with cooldown)
  const xpCooldownKey = `xp_${message.author.id}`;
  if (!client.cooldowns.has(xpCooldownKey)) {
    const xpGain = Math.floor(Math.random() * 10) + 5;
    const creditGain = Math.floor(Math.random() * 3) + 1;
    
    const levelUp = client.db.addXP(message.guild.id, message.author.id, xpGain);
    client.db.addCredits(message.guild.id, message.author.id, creditGain);
    
    if (levelUp) {
      const userData = client.db.getUser(message.guild.id, message.author.id);
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 Level Up!')
        .setDescription(`Congratulations ${message.author}! You reached **Level ${userData.level}**!`)
        .setThumbnail(message.author.displayAvatarURL());
      message.channel.send({ embeds: [embed] }).catch(() => {});
    }
    
    client.cooldowns.set(xpCooldownKey, true);
    setTimeout(() => client.cooldowns.delete(xpCooldownKey), 60000);
  }
  
  // Command handling
  const prefix = PREFIXES.find(p => message.content.startsWith(p));
  if (!prefix) {
    // Increment message count for non-command messages
    client.db.incrementMessageCount(message.guild.id, message.author.id);
    return;
  }
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  // Special handling for hidden commands with % prefix
  let actualCommandName = commandName;
  if (prefix === '%') {
    if (commandName.startsWith('dh.')) {
      actualCommandName = commandName.slice(3); // remove dh.
    } else {
      actualCommandName = commandName; // handle commands like %rn
    }
  }

  const command = client.commands.get(actualCommandName);
  if (!command) return;
  
  // Check permissions
  if (command.ownerOnly || message.author.id === OWNER_ID) {
    // Owner bypasses everything
  } else {
    if (command.ownerOnly && message.author.id !== OWNER_ID) {
      return message.reply('❌ This command is only for the server owner.');
    }

    const settings = client.db.getGuildSettings(message.guild.id) || {};
    const isAdmin = message.member.permissions.has('Administrator') || 
                  message.member.roles.cache.has(ADMIN_ROLE_ID) ||
                  (settings.admins && settings.admins.includes(message.author.id));

    if ((command.adminOnly || command.hidden) && !isAdmin) {
      return message.reply('❌ This command requires Administrator permissions.');
    }
    
    if (command.modOnly) {
      if (!isAdmin && !message.member.permissions.has('ManageMessages')) {
        return message.reply('❌ This command requires Moderator permissions.');
      }
    }
  }
  
  // Cooldown handling
  if (command.cooldown) {
    const cooldownKey = `${command.name}_${message.author.id}`;
    if (client.cooldowns.has(cooldownKey)) {
      const remaining = (client.cooldowns.get(cooldownKey) - Date.now()) / 1000;
      return message.reply(`⏰ Please wait ${remaining.toFixed(1)} seconds before using this command again.`);
    }
    client.cooldowns.set(cooldownKey, Date.now() + command.cooldown * 1000);
    setTimeout(() => client.cooldowns.delete(cooldownKey), command.cooldown * 1000);
  }
  
  // Delete hidden command messages
  if (prefix === '%') {
    try {
      await message.delete();
    } catch (err) {
      console.error('Failed to delete hidden command message:', err);
    }
  }

  try {
    await command.execute(message, args, client);
  } catch (error) {
    if (error.code === 50013) {
      console.error(`Permission error in ${message.guild.name}:`, error.message);
      return message.author.send(`❌ I'm missing permissions (Send Messages or Embed Links) in <#${message.channel.id}> to execute \`${commandName}\`.`).catch(() => {});
    }
    console.error(`Error executing ${commandName}:`, error);
    message.reply('❌ There was an error executing that command.').catch(() => {});
  }
});

// Handle invite create/delete for tracking
client.on('inviteCreate', async invite => {
  const invites = client.invites.get(invite.guild.id) || new Collection();
  invites.set(invite.code, invite.uses);
  client.invites.set(invite.guild.id, invites);
});

client.on('inviteDelete', async invite => {
  const invites = client.invites.get(invite.guild.id);
  if (invites) {
    invites.delete(invite.code);
  }
});

// Slash command interaction handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // Advanced interaction arg handling for all command types
    let finalArgs = [];
    
    // Universal option extractor
    const options = interaction.options.data;
    if (options.length > 0) {
      // Priority ordering for common commands
      if (interaction.commandName === 'gwy') {
        finalArgs = [
          interaction.options.getInteger('winners')?.toString(),
          interaction.options.getString('time'),
          interaction.options.getString('prize_name'),
          interaction.options.getString('prize_detail')
        ];
      } else if (interaction.commandName === 'drop') {
        finalArgs = [
          interaction.options.getInteger('count')?.toString(),
          interaction.options.getString('prize')
        ];
      } else if (['tip', 'addcredits', 'removecredits', 'givedollar', 'giveltc'].includes(interaction.commandName)) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.get('amount')?.value;
        finalArgs = [user ? `<@${user.id}>` : '', amount?.toString() || ''];
      } else if (['warn', 'mute', 'history', 'clearhistory', 'level', 'balance', 'wallet', 'avatar', 'invited'].includes(interaction.commandName)) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        finalArgs = user ? [`<@${user.id}>`] : [];
        if (reason) finalArgs.push(reason);
      } else if (interaction.commandName === 'unwarn') {
        const user = interaction.options.getUser('user');
        const id = interaction.options.getInteger('warning_id');
        finalArgs = [`<@${user.id}>`, id?.toString()];
      } else if (['deposit', 'withdraw'].includes(interaction.commandName)) {
        finalArgs = [interaction.options.getString('type'), interaction.options.getInteger('amount')?.toString()];
      } else if (interaction.commandName === 'redeemshop') {
        finalArgs = [interaction.options.getString('action'), interaction.options.getString('type')];
      } else {
        // Default mapping: just take all values in order
        finalArgs = options.map(opt => {
          if (opt.type === 6) return `<@${opt.value}>`; // User type
          return opt.value?.toString() || '';
        });
      }
    }

    const shimMessage = {
      ...interaction,
      isChatInputCommand: true, // Marker for commands to know they are interactions
      reply: (content) => {
        if (interaction.replied || interaction.deferred) {
          return interaction.editReply(content);
        }
        return interaction.reply(content);
      },
      channel: interaction.channel,
      author: interaction.user,
      member: interaction.member,
      guild: interaction.guild,
      mentions: { 
        users: new Collection(interaction.options.getUser('user') ? [[interaction.options.getUser('user').id, interaction.options.getUser('user')]] : []),
        members: new Collection(interaction.options.getMember('user') ? [[interaction.options.getMember('user').id, interaction.options.getMember('user')]] : [])
      }
    };

    await command.execute(shimMessage, finalArgs, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ DISCORD_BOT_TOKEN environment variable is not set!');
  process.exit(1);
}

// VC tracking
const vcJoinTime = new Map();

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.member.user.bot) return;

  // Joined VC
  if (!oldState.channelId && newState.channelId) {
    vcJoinTime.set(newState.member.id, Date.now());
  }
  // Left VC
  else if (oldState.channelId && !newState.channelId) {
    const joinTime = vcJoinTime.get(newState.member.id);
    if (joinTime) {
      const minutes = Math.floor((Date.now() - joinTime) / 60000);
      if (minutes > 0) {
        client.db.addVCMinutes(newState.guild.id, newState.member.id, minutes);
      }
      vcJoinTime.delete(newState.member.id);
    }
  }
  // Changed channel
  else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    const joinTime = vcJoinTime.get(newState.member.id);
    if (joinTime) {
      const minutes = Math.floor((Date.now() - joinTime) / 60000);
      if (minutes > 0) {
        client.db.addVCMinutes(newState.guild.id, newState.member.id, minutes);
      }
    }
    vcJoinTime.set(newState.member.id, Date.now());
  }
});

client.login(token);
