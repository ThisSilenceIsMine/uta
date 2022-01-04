import { SlashCommandBuilder } from '@discordjs/builders';
import {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { GuildMember, Interaction } from 'discord.js';
import { MusicSubscription } from '../lib/Subscription';
import { Track } from '../lib/Track';
import { subscriptions } from '../subscriptions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays track from youtube url')
    .addStringOption((opt) =>
      opt.setName('url').setDescription('URL to play').setRequired(true)
    ),
  async execute(interaction: Interaction) {
    if (!interaction.isCommand() || !interaction.guildId) return;

    let subscription = subscriptions.get(interaction.guildId);

    const urlOption = interaction.options.get('url');
    if (!urlOption) {
      return await interaction.reply('Please, specify URL!');
    }
    const url = urlOption.value as string;

    if (!subscription) {
      const user = interaction.member;

      if (user instanceof GuildMember && user.voice.channel) {
        const channel = user.voice.channel;

        const player = new MusicSubscription(
          await joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
          })
        );
        player.voiceConnection.on('error', console.warn);
        subscriptions.set(interaction.guildId, player);
        subscription = player;
      } else {
        await interaction.reply('Join vc first!');
        return;
      }
    }

    try {
      await entersState(
        subscription.voiceConnection,
        VoiceConnectionStatus.Ready,
        20e3
      );
    } catch (error) {
      console.warn(error);
      return void (await interaction.followUp('Failed to join'));
    }

    try {
      const track = await Track.from(url);
      subscription.enqueue(track);
      await interaction.reply(`Added **${track.title}** to the queue!`);
    } catch (error) {
      console.warn(error);
      await interaction.reply('Failed to play');
    }
  },
};
