import { TwitchAPI } from "https://deno.land/x/tmi/mod.ts";
import {
  StreamData,
} from "https://deno.land/x/tmi@v0.0.7/lib/twitch_api_types.ts";

import { PhasesValues, Phases } from "./commands_phases.ts";
import { PhaseHandler } from "./shared_types.ts";

export type FollowerMap = Map<number, StreamData>;

export class Followers {
  private api: TwitchAPI;

  public interval: number | null = null;
  public name: PhasesValues = Phases.followers;

  data: FollowerMap = new Map();

  constructor(clientId: string, oauth: string) {
    this.api = new TwitchAPI(clientId, oauth);
  }

  *iterFollowers() {
    for (const follower of this.data) {
      yield follower;
    }
  }
  async fetchFollows() {
    try {
      const follows = await this.api.getFollowers();
      if (
        !follows.streams || !follows.streams.length
      ) {
        throw "No streams were found";
      }
      const m = new Map<number, StreamData>();
      for (let x = 0; x < follows.streams.length; x++) {
        const follow = follows.streams[x];
        m.set(x, follow);
      }
      if (!this.interval) {
        this.interval = setInterval(() => this.fetchFollows(), 60000 * 5);
      }
      this.data = m;
    } catch (e) {
      console.error(`Error setting new followers`);
    }
  }
  get handler(): PhaseHandler<StreamData> {
    return {
      show: this.iterFollowers,
      prefix: "Select follower # >",
    };
  }

  [Symbol.iterator](): IterableIterator<[number, StreamData]> {
    return this.iterFollowers();
  }
}
