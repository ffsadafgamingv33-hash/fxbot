const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or CLIENT_ID');
  process.exit(1);
}

const commands = [];
const commandNames = new Set();
const commandFolders = fs.readdirSync(path.join(__dirname, 'src', 'commands'));

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'src', 'commands', folder)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./src/commands/${folder}/${file}`);
    if (command.name) {
      const cleanName = command.name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      
      if (cleanName === command.name.toLowerCase() && !commandNames.has(cleanName)) {
        const slashCommand = new SlashCommandBuilder()
          .setName(cleanName)
          .setDescription(command.description || 'No description provided');
        
        // Define command options based on command names
        switch (cleanName) {
          case 'drop':
            slashCommand.addIntegerOption(opt => opt.setName('count').setDescription('How many people can claim').setRequired(true))
                        .addStringOption(opt => opt.setName('prize').setDescription('What to drop').setRequired(true));
            break;
          case 'gwy':
            slashCommand.addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setRequired(true))
                        .addStringOption(opt => opt.setName('time').setDescription('Duration (e.g. 1h, 10m)').setRequired(true))
                        .addStringOption(opt => opt.setName('prize_name').setDescription('Name of the prize').setRequired(true))
                        .addStringOption(opt => opt.setName('prize_detail').setDescription('Actual prize to DM').setRequired(true));
            break;
          case 'slots':
          case 'crash':
          case 'dice':
          case 'roulette':
            slashCommand.addIntegerOption(opt => opt.setName('amount').setDescription('Amount to bet').setRequired(true));
            if (cleanName === 'roulette') {
              slashCommand.addStringOption(opt => opt.setName('space').setDescription('Space to bet on (e.g. red, black, 0-36)').setRequired(true));
            }
            break;
          case 'coinflip':
            slashCommand.addIntegerOption(opt => opt.setName('amount').setDescription('Amount to bet').setRequired(true))
                        .addStringOption(opt => opt.setName('choice').setDescription('Heads or Tails').setRequired(true).addChoices({name: 'Heads', value: 'heads'}, {name: 'Tails', value: 'tails'}));
            break;
          case 'tip':
            slashCommand.addUserOption(opt => opt.setName('user').setDescription('User to tip').setRequired(true))
                        .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to tip').setRequired(true));
            break;
          case 'deposit':
          case 'withdraw':
            slashCommand.addStringOption(opt => opt.setName('type').setDescription('Currency type').setRequired(true))
                        .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true));
            break;
          case 'redeem':
            slashCommand.addStringOption(opt => opt.setName('code').setDescription('The code to redeem').setRequired(true));
            break;
          case 'redeemshop':
            slashCommand.addStringOption(opt => opt.setName('action').setDescription('Action to perform (view/buy)').setRequired(true).addChoices({name: 'View', value: 'view'}, {name: 'Buy', value: 'buy'}))
                        .addStringOption(opt => opt.setName('type').setDescription('Code type (10/100/1000)').setRequired(false));
            break;
          case 'buy':
            slashCommand.addStringOption(opt => opt.setName('item_id').setDescription('ID of the item to buy').setRequired(true));
            break;
          case 'warn':
          case 'mute':
            slashCommand.addUserOption(opt => opt.setName('user').setDescription('User to moderate').setRequired(true))
                        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the action').setRequired(false));
            break;
          case 'unwarn':
            slashCommand.addUserOption(opt => opt.setName('user').setDescription('User to unwarn').setRequired(true))
                        .addIntegerOption(opt => opt.setName('warning_id').setDescription('ID of the warning to remove').setRequired(true));
            break;
          case 'history':
            slashCommand.addUserOption(opt => opt.setName('user').setDescription('User to check history for').setRequired(true));
            break;
          case 'clearhistory':
            slashCommand.addUserOption(opt => opt.setName('user').setDescription('User to clear history for').setRequired(true));
            break;
          case 'level':
          case 'balance':
          case 'wallet':
          case 'avatar':
          case 'invited':
            slashCommand.addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(false));
            break;
          case 'addcredits':
          case 'removecredits':
            slashCommand.addUserOption(opt => opt.setName('user').setDescription('User to modify credits for').setRequired(true))
                        .addIntegerOption(opt => opt.setName('amount').setDescription('Amount of credits').setRequired(true));
            break;
          case 'givedollar':
          case 'giveltc':
            slashCommand.addUserOption(opt => opt.setName('user').setDescription('User to give currency to').setRequired(true))
                        .addNumberOption(opt => opt.setName('amount').setDescription('Amount to give').setRequired(true));
            break;
          case 'opencrate':
            slashCommand.addStringOption(opt => opt.setName('crate_type').setDescription('Type of crate to open').setRequired(true));
            break;
          case 'buycratekey':
            slashCommand.addStringOption(opt => opt.setName('crate_type').setDescription('Type of crate key to buy').setRequired(true))
                        .addIntegerOption(opt => opt.setName('amount').setDescription('Amount of keys to buy').setRequired(false));
            break;
        }
        
        commands.push(slashCommand.toJSON());
        commandNames.add(cleanName);
      }
    }
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();