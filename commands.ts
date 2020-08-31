export enum Commands {
  followers = "!followers",
  channel = "!channel",
  exit = "!exit",
}
export type KeyOfCommands = keyof typeof Commands;
