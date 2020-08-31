export enum Phases {
  followers = "followers",
  normal = "normal",
}
export enum Commands {
  show = "show",
  exit = "exit",
}
export type PhasesKeys = keyof typeof Phases;
export type PhasesValues = typeof Phases[PhasesKeys];

export type CommandKeys = keyof typeof Commands;
