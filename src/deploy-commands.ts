import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import path from 'path';
import { CLIENT_ID, TOKEN } from './lib/globals.env';

const commands = [];

const commandFiles = fs
  .readdirSync(path.join(__dirname, './commands'))
  .filter((file) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const command = require(path.join(__dirname, `./commands/${file}`));

  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands');

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
})();
