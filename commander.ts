import { Followers } from "./followers.ts";
import { green } from "https://deno.land/std@0.66.0/fmt/colors.ts";
import { Phases, Commands, PhasesValues } from "./commands_phases.ts";

export type PhaseHandler = {};

export class Commander {
  phase: PhasesValues = Phases.normal;

  prefixes = new Map<PhasesValues, string>([
    [Phases.followers, "Select follower # > "],
    [Phases.normal, "Enter channel/command > "],
  ]);

  constructor(private followers: Followers) {}

  setPhase(line: string) {
    if (line in Phases) {
      //@ts-ignore
      switch (line) {
        case Phases.followers:
          break;
        default:
          console.log(`Default case ran ${line}`);
      }
      //@ts-ignore
      this.phase = Phases[line];
    } else if (line === "exit") {
      this.phase = Phases.normal;
    }
  }
  reset() {
    this.phase = Phases.normal;
  }
  exit() {
    //cleanup
    if (this.followers.interval) {
      clearInterval(this.followers.interval);
    }
  }
  showFollowers() {
    for (const [num, stream] of this.followers) {
      console.log(green(`[${num}]: ${stream.channel.name}`));
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
    }
  }
}
