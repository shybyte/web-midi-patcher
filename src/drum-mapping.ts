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