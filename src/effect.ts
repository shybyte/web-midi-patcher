export interface Effect {
  monoGroups: string[],
  trigger(velocity: number, time: number) : void;
  play(output: WebMidi.MIDIOutput, time: number): void;
  hasFinished(): boolean;
}
