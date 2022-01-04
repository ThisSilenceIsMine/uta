import dotenv from 'dotenv';
import {
  Client,
  GuildMember,
  Intents,
  Snowflake,
  Collection,
} from 'discord.js';
import {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import fs from 'fs';
import path from 'path';

import { MusicSubscription } from './lib/Subscription';
import { Track } from './lib/Track';
import { subscriptions } from './subscriptions';

dotenv.config();

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

client.login(process.env.token);

// const PlayerCommands = Object.freeze({
//   Play: 'play',
//   Stop: 'stop',
//   Skip: 'skip',
//   Queue: 'queue',
//   Pause: 'pause',
// });

// const Commands = Object.freeze({
//   Ping: 'ping',
// });

// client.on('messageCreate', async (message) => {
//   if (!message.guild) return;
//   if (!client.application?.owner) await client.application?.fetch();

//   if (
//     message.content.toLowerCase() === 'uta!deploy' &&
//     message.author.id === client.application?.owner?.id
//   ) {
//     await message.guild.commands.set([
//       {
//         name: PlayerCommands.Play,
//         description: 'Plays track from youtube url',
//         options: [
//           {
//             name: 'url',
//             description: 'YouTube track url',
//             type: 3,
//             required: true,
//           },
//         ],
//       },
//       {
//         name: PlayerCommands.Stop,
//         description: 'Stops music and leaves voice channel',
//       },
//       {
//         name: Commands.Ping,
//         description: 'pong!',
//       },
//       {
//         name: PlayerCommands.Queue,
//         description: 'Print songs in queue',
//       },
//       {
//         name: PlayerCommands.Pause,
//         description: 'Put player on a pause',
//       },
//       {
//         name: PlayerCommands.Skip,
//         description: 'This song is shit, jump to next one',
//       },
//     ]);

//     await message.reply('Deployed!');
//   }
// });

// client.on('interactionCreate', async (interaction) => {
//   if (!interaction.isCommand() || !interaction.guildId) return;

//   const { commandName } = interaction;

//   if (!Object.values(PlayerCommands).includes(commandName)) return;

//   let subscription = subscriptions.get(interaction.guildId);

//   switch (commandName) {
//     case PlayerCommands.Play:
//       {
//         const urlOption = interaction.options.get('url');
//         if (!urlOption) {
//           return await interaction.reply('Please, specify URL!');
//         }
//         const url = urlOption.value as string;

//         if (!subscription) {
//           const user = interaction.member;

//           if (user instanceof GuildMember && user.voice.channel) {
//             const channel = user.voice.channel;

//             const player = new MusicSubscription(
//               await joinVoiceChannel({
//                 channelId: channel.id,
//                 guildId: channel.guildId,
//                 adapterCreator: channel.guild.voiceAdapterCreator,
//               })
//             );
//             player.voiceConnection.on('error', console.warn);
//             subscriptions.set(interaction.guildId, player);
//             subscription = player;
//           } else {
//             await interaction.reply('Join vc first!');
//             return;
//           }
//         }

//         try {
//           await entersState(
//             subscription.voiceConnection,
//             VoiceConnectionStatus.Ready,
//             20e3
//           );
//         } catch (error) {
//           console.warn(error);
//           return void (await interaction.followUp('Failed to join'));
//         }

//         try {
//           const track = await Track.from(url);
//           subscription.enqueue(track);
//           await interaction.reply(`Added **${track.title}** to the queue!`);
//         } catch (error) {
//           console.warn(error);
//           await interaction.reply('Failed to play');
//         }
//       }
//       break;
//     case PlayerCommands.Stop:
//       {
//         if (subscription) {
//           subscription.voiceConnection.destroy();
//           subscriptions.delete(interaction.guildId);
//           await interaction.reply('GoodBye!');
//         }
//       }
//       break;
//     case PlayerCommands.Queue:
//       {
//         if (subscription) {
//           // const current =
//           //   subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
//           //     ? 'Nothing is currently playing!'
//           //     : `Playing **${
//           //         (
//           //           subscription.audioPlayer.state
//           //             .resource as AudioResource<Track>
//           //         ).metadata.title
//           //       }**`;

//           const queue = subscription.queue
//             .slice(0, 5)
//             .map((track, index) => `${index + 1}) ${track.title}`);
//           console.log(subscription.queue);
//           await interaction.reply(`Queue: **${queue}**`);
//         } else {
//           await interaction.reply('Not playing anything rn');
//         }
//       }
//       break;
//     case PlayerCommands.Skip:
//       {
//         if (subscription) {
//           subscription.audioPlayer.stop();
//           await interaction.reply('Skipped that shit');
//         } else {
//           interaction.reply('Nothing to skip, lol');
//         }
//       }
//       break;
//     default:
//       await interaction.reply(
//         'Command not found, what the actual fuck are you trying to do?'
//       );
//       break;
//   }
// });

// //Other, non music-related commands
// client.on('interactionCreate', async (interaction) => {
//   if (!interaction.isCommand()) return;

//   const { commandName } = interaction;

//   switch (commandName) {
//     case Commands.Ping: {
//       await interaction.reply('Pong!');
//       break;
//     }
//   }
// });
