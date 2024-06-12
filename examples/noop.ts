import { NowPlaying, Providers, StorageKinds } from "../src";

const np = new NowPlaying(Providers.NOOP, {
  storageKind: StorageKinds.INMEMORY,
});

console.log("Hello World", np);
