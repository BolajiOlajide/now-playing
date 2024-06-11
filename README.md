# Now Playing

Collaborative effort with [@lilpolymath](https://github.com/lilpolymath) to create a library that can be used to display
the currently playing song from a user's streaming platform.

This library is built to be generic to work with multiple providers and storage mechanisms.

## Usage

```ts
const np = new NowPlaying(Providers.SPOTIFY, {
  storageKind: StorageKinds.INMEMORY,
})
```
