export interface IStreamer {
  authenticate(): boolean
  fetchCurrentlyPlaying(): Promise<CurrentlyPlaying>
}

export interface CurrentlyPlaying {
  title: string;
  artiste: string;
  imageUrl: string;
  genre: string;
  isPlaying: boolean;
}
