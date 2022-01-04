import { SlashCommandBuilder } from '@discordjs/builders';

import { Interaction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    await interaction.reply('pong');
  },
};
