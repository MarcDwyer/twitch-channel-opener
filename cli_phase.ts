import { FollowerMap } from "./followers.ts";

export enum Phases {
  followers = "followers",
  normal = "normal",
}
type PhasesKeys = keyof typeof Phases;
type PhasesValues = typeof Phases[PhasesKeys];

// needs follower data in order to select;

export class CommandPhase {
  phase: PhasesValues = Phases.normal;

  prefixes = new Map<PhasesValues, string>([
    [Phases.followers, "Select follower # > "],
    [Phases.normal, "Enter channel/command > "],
  ]);

  constructor() {}

  setStatus(line: string) {
    if (line in Phases) {
      //@ts-ignore
      this.phase = Phases[line];
    }
  }
  get prefix() {
    return this.prefixes.get(this.phase) || "Enter channel name ";
  }
  async runCmd(channel: string) {
    const url =
      `https://player.twitch.tv/?channel=${channel}&enableExtensions=false&muted=false&parent=twitch.tv&player=popout&volume=0.08
  `;
    const cmd = [
      "open",
      url,
    ];
    const p = Deno.run({
      cmd,
    });
    try {
      const s = await p.status();
      return s;
    } catch (err) {
      throw new Error("Error running comand");
    } finally {
      this.phase = Phases.normal;
    }
  }
}
