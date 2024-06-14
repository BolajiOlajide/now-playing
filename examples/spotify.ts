import { NowPlaying, Providers, StorageKinds } from "../dist";

const np = new NowPlaying(Providers.SPOTIFY, {
  storageKind: StorageKinds.INMEMORY,
  streamerArgs: {
    clientId: 'foo',
    clientSecret: 'bar',
    refreshToken: 'baz',
  },
});


console.log("Hello World", np);
