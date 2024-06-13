import { NowPlaying, Providers, StorageKinds } from "../src";

const np = new NowPlaying(Providers.NOOP, {
  storageKind: StorageKinds.INMEMORY,
  cacheSong: false,
  cacheDuration: 60 * 60 * 24,
});

console.log("Hello World", np);
