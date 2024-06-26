import type { Song } from "../streamers";
import type { SpotifyTrack } from "../streamers/spotify.streamer";

export const KanyeHomeComingSong: Song = {
  is_playing: false,
  title: 'Coming Home',
  artiste: 'Kanye West',
  image_url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
  preview_url:
    'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
  url: 'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
}

export const KanyeHomeComingSongResponse: { track: SpotifyTrack } = {
  track: {
    name: 'Coming Home',
    artists: [{ name: 'Kanye West' }],
    external_urls: {
      spotify:
        'https://open.spotify.com/track/6M2wZ9GZgrQXHCFfjv46we',
    },
    album: {
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273712549143' },
      ],
    },
    preview_url:
      'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
  },
}


export const CurrentlyPlayingTrackResponse: SpotifyTrack = {
  name: 'Kolwa',
  artists: [
    { name: 'Euggy' },
    { name: 'Suraj' },
    { name: 'Mumba Yachi' },
  ],
  external_urls: {
    spotify:
      'https://open.spotify.com/track/4U6zIONOpmnby5fvOM6han?si=a7661613c3fa46c3',
  },
  album: {
    images: [
      {
        url: 'https://i.scdn.co/image/ab67616d0000b273712549143',
      },
    ],
  },
  preview_url:
    'https://p.scdn.co/mp3-preview/0663627c27885467868491a91185643b0508975c?cid=774b29d4f13844c495f206cafdad9c86',
}
