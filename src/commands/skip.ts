import { SlashCommandBuilder } from '@discordjs/builders';

import { Interaction } from 'discord.js';

import { subscriptions } from '../subscriptions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips current track'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const subscription = subscriptions.get(interaction.guildId);
    if (subscription) {
      subscription.audioPlayer.stop();
      await interaction.reply('Skipped that shit');
    } else {
      interaction.reply('Nothing to skip, lol');
    }
  },
};
