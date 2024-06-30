# Now Playing

Collaborative effort with [@lilpolymath](https://github.com/lilpolymath) to create a library that can be used to display
the currently playing song from a user's streaming platform.

This library is built to be generic to work with multiple providers and storage mechanisms.

## Installation

To install the package, use your preferred package manager:

```bash
# npm
npm install @BolajiOlajide/now-playing

# yarn
yarn add @BolajiOlajide/now-playing
```

## Usage

```ts
import { NowPlaying, Providers, type IStorer } from '@BolajiOlajide/now-playing'

let myCustomStorer: IStorer

const np = new NowPlaying(Providers.SPOTIFY, {
  useCache: false, // (optional) default is true
  cacheDuration: 30000, // (optional) in milliseconds
  streamerArgs: {
    clientId: 'foo',
    clientSecret: 'bar',
    refreshToken: 'baz',
  },
  storer: myCustomStorer, // (optional) custom storage implementation
})
```

### Storage

We default to inmemory storage for saving information gotten via the API, (e.g Access tokens, Song data e.t.c).
However you can pass in your own custom storage object, provided it satisfies the `IStorer` interface.

```ts
interface IStorer {
  set<T>(key: string, value: T, duration: number): void
  get<T>(key: string): T | undefined
  delete(key: string): boolean
  has(key: string): boolean
  clear(): void
  pruneExpiredEntries(): void
}
```

### Providers

#### Spotify

You need three things.

1. Spotify Client ID
2. Spotify Client Secret
3. Spotify Refresh Token

To get your Spotify Client ID and sercet, follow these steps:

1. Log in to your [Spotify Dashboard](https://developer.spotify.com/dashboard/applications).
2. Create a new app by clicking on the "Create an App" button. You can name your app whatever you like.
3. After creating the app, you will see the details page for your app. Here, you can find your client ID and client secret.

You'll need these credentials to generate a refresh token for Spotify.

Spotify's access token expires every hour, so you will need a refresh token to obtain a new one automatically. To get your refresh token, refer to the following articles for a detailed guide:

- [How to create a Spotify refresh token](https://benwiz.com/blog/create-spotify-refresh-token/)
- [Connecting your React Vite.js app to Spotify's API](https://reine.hashnode.dev/how-to-connect-your-react-vitejs-app-to-spotifys-api)

Make sure to include the following scopes: "user-read-currently-playing" and "user-read-recently-played" when setting up the authorization process.

## Contributing

We welcome contributions from the community! To contribute:

- Fork the repository.
- Create a new branch with a descriptive name.
- Make your changes and commit them with a descriptive message.
- Push your changes to your forked repository.
- Open a pull request to the main repository.
