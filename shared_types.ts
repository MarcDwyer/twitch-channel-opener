export type PhaseHandler<T> = {
  show: () => Generator<[number, T]> | null;
  prefix: string;
};
