export function flipCoin(): boolean {
  return Math.random() < 0.5;
}

export function generateID(): string {
  return crypto.randomUUID();
}