import type { CurrentlyPlaying } from './types'

export class SpotifyStreamer {
  public authenticate(): boolean {
    return true
  }

  fetchCurrentlyPlaying(): Promise<CurrentlyPlaying> {
    return new Promise((resolve) => {
      resolve({
        title: 'The title',
        artiste: 'The artist',
        imageUrl: 'https://the.image.url',
        genre: 'The genre',
        isPlaying: true,
      })
    })
  }
}
