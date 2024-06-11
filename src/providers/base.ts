interface StreamingProvider {
  authenticate(): boolean;
  fetchCurrentlyPlaying(): Promise<CurrentlyPlaying>
}

interface CurrentlyPlaying {
  title: string;
  artiste: string;
  imageUrl: string;
  genre: string;
  isPlaying: boolean;
}
