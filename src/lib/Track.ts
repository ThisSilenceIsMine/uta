import { createAudioResource } from '@discordjs/voice';
import ytdl from 'ytdl-core-discord';
import { getTitle } from './YtMetadata';

export interface TrackData {
  url: string;
  title: string;
}

export class Track implements TrackData {
  url: string;
  title: string;

  constructor(track: TrackData) {
    this.url = track.url;
    this.title = track.title;
  }

  async createAudioResource() {
    return createAudioResource(await ytdl(this.url));
  }

  static async from(url: string): Promise<Track> {
    // const { title } = await (await getInfo(url)).videoDetails;
    const title = await getTitle(url);

    // const title = 'Never Gonna Give You Up';
    return new Track({ url, title });
  }
}
