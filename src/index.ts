import { Client, Intents, Collection } from 'discord.js';

import fs from 'fs';
import path from 'path';

import { TOKEN } from './lib/globals.env';

type CustomClient = Client & { commands?: Collection<string, any> };

const client: CustomClient = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.commands = new Collection();

const commandFiles = fs
  .readdirSync(path.join(__dirname, './commands'))
  .filter((file) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const command = require(path.join(__dirname, `./commands/${file}`));

  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands!.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'Something went wrong',
      ephemeral: true,
    });
  }
});

client.login(TOKEN);
