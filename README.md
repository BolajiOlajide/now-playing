# Now Playing

Collaborative effort with [@lilpolymath](https://github.com/lilpolymath) to create a library that can be used to display
the currently playing song from a user's streaming platform.

This library is built to be generic to work with multiple providers and storage mechanisms.

## Usage

```ts
import {
  NowPlaying,
  Providers,
  StorageKinds,
} from "@BolajiOlajide/now-playing";

const np = new NowPlaying(Providers.SPOTIFY, {
  storageKind: StorageKinds.INMEMORY,
});
```


### With Spotify
```ts
import {
  NowPlaying,
  Providers,
  StorageKinds,
} from "@BolajiOlajide/now-playing";

const np = new NowPlaying(Providers.SPOTIFY, {
  storageKind: StorageKinds.INMEMORY,
  useCache: false, // default is true
  cacheDuration: 30000, // in milliseconds
  streamerArgs: {
    clientId: "foo",
    clientSecret: "bar",
    refreshToken: "baz",
  }
});
```
