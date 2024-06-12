import type { CurrentlyPlaying, IStreamer } from './types'

export class NoopStreamer implements IStreamer {
  public authenticate(): boolean {
    return true
  }

  fetchCurrentlyPlaying(): Promise<CurrentlyPlaying> {
    return new Promise((resolve) => {
      resolve({
        title: 'The title',
        artiste: 'The artist',
        image_url: 'https://the.image.url',
        genre: 'The genre',
        is_playing: true,
      })
    })
  }
}
