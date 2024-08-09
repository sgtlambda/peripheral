export function shouldBlink(remainingMilliseconds: number): boolean {
  const period = Math.max(50, remainingMilliseconds / 10);
  return Math.floor(remainingMilliseconds / period) % 2 === 0;
}