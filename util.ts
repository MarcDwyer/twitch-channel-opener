export function findKey(line: string, keys: string[]): string | null {
  for (const key of keys) {
    if (line === key) return key;
  }
  return null;
}
