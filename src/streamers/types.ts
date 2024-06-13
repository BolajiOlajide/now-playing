export interface IStreamer {
  fetchCurrentlyPlaying(
    cacheSong: boolean,
    cacheDuration: number
  ): Promise<Song | null>;
}

export interface Song {
  title: string;
  artiste: string;
  image_url: string;
  is_playing: boolean;
  preview_url: string;
  url: string;
}
