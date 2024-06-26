import type { Song, IStreamer } from './types'

export class NoopStreamer implements IStreamer {
  public authenticate(): boolean {
    return true
  }

  fetchCurrentlyPlaying(): Promise<Song> {
    return new Promise((resolve) => {
      resolve({
        title: 'The title',
        artiste: 'The artist',
        image_url: 'https://the.image.url',
        url: 'https://the.url',
        is_playing: true,
        preview_url: 'https://the.preview.url',
      })
    })
  }
}
