export enum GmRockKit {
  kick,
  stick,
  snare,
  handClap,
  snareRimshot,
  floorTom,
  hatClosed,
  tom2,
  hatOpen,
  cowbell,
  ride,
  crash,
  ride2,
  splash,
  hatSemiOpen,
  bell
}

export enum FluidStandard {
  kick = 36,
  snare = 41,
  hatClosed = 70,
}

export const gmRockKitToFluidStandard = {
  [GmRockKit.kick]: FluidStandard.kick,
  [GmRockKit.snare]: FluidStandard.snare,
  [GmRockKit.snareRimshot]: FluidStandard.snare,
  [GmRockKit.hatClosed]: FluidStandard.hatClosed,
}

export const gmRockKitToHandSonicStandard = {
  [GmRockKit.kick]: 74,
  [GmRockKit.snare]: 60,
  [GmRockKit.hatClosed]: 64,
  [GmRockKit.snareRimshot]: 60,
}