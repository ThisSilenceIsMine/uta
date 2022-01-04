import { SlashCommandBuilder } from '@discordjs/builders';

import { Interaction } from 'discord.js';

import { subscriptions } from '../subscriptions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Prints queue'),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const subscription = subscriptions.get(interaction.guildId);
    if (subscription) {
      // const current =
      //   subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
      //     ? 'Nothing is currently playing!'
      //     : `Playing **${
      //         (
      //           subscription.audioPlayer.state
      //             .resource as AudioResource<Track>
      //         ).metadata.title
      //       }**`;

      const queue = subscription.queue
        .slice(0, 5)
        .map((track, index) => `${index + 1}) ${track.title}`);
      console.log(subscription.queue);
      await interaction.reply(`Queue: **${queue}**`);
    } else {
      await interaction.reply('Not playing anything rn');
    }
  },
};
