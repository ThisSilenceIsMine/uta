import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  entersState,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { Track } from './Track';

const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class MusicSubscription {
  readonly audioPlayer: AudioPlayer;
  readonly voiceConnection: VoiceConnection;
  queueLock = false;
  queue: Track[];

  constructor(voiceConnection: VoiceConnection) {
    this.voiceConnection = voiceConnection;
    this.audioPlayer = createAudioPlayer();
    this.queue = [];
    this.voiceConnection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            await entersState(
              this.voiceConnection,
              VoiceConnectionStatus.Connecting,
              5_000
            );
          } catch {
            this.voiceConnection.destroy();
          }
        } else if (this.voiceConnection.rejoinAttempts > 5) {
          await waitFor((this.voiceConnection.rejoinAttempts + 1) * 5_000);
        } else {
          this.voiceConnection.destroy();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        this.stop();
      }
    });

    this.audioPlayer.on('stateChange', (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        void this.processQueue();
      }
    });

    this.voiceConnection.subscribe(this.audioPlayer);
  }

  enqueue(track: Track) {
    this.queue.push(track);
    this.processQueue();
  }

  stop() {
    this.queue = [];
    this.queueLock = false;
    this.audioPlayer.stop(true);
  }

  private async processQueue(): Promise<void> {
    if (
      this.queueLock ||
      this.audioPlayer.state.status !== AudioPlayerStatus.Idle ||
      this.queue.length === 0
    ) {
      console.log('processing queue failed');
      return;
    }

    this.queueLock = true;

    const nextTrack = this.queue.shift()!;
    try {
      const resource = await nextTrack.createAudioResource();

      this.audioPlayer.play(resource);
      this.queueLock = false;
    } catch (error) {
      this.queueLock = false;
      return this.processQueue();
    }
  }
}
