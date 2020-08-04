export function waitMs(duration: number) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

export type Range = [number, number];

export function mapRange(sourceRange: Range, targetRange: Range, value: number): number {
  if (value <= sourceRange[0]) {
    return targetRange[0];
  } else if (value >= sourceRange[1]) {
    return targetRange[1];
  }
  return targetRange[0] + (value - sourceRange[0]) * (targetRange[1] - targetRange[0]) / (sourceRange[1] - sourceRange[0]);
}
