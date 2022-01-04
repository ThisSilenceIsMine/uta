import { SlashCommandBuilder } from '@discordjs/builders';

import { Interaction } from 'discord.js';

import { subscriptions } from '../subscriptions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops playing music and leaves'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const subscription = subscriptions.get(interaction.guildId);

    if (subscription) {
      subscription.voiceConnection.destroy();
      subscriptions.delete(interaction.guildId);
      await interaction.reply('GoodBye!');
    }
  },
};
