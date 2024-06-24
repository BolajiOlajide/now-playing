export interface IStreamer {
  fetchCurrentlyPlaying(): Promise<Song | null>;
}

export interface IStreamerCacheOpts {
  useCache: boolean;
  cacheDuration: number;
}

export interface Song {
  title: string;
  artiste: string;
  image_url: string;
  is_playing: boolean;
  preview_url: string;
  url: string;
}
