import {Effect} from '../effect'

export class ControlSequencer implements Effect {
  monoGroups = [''];

  startTime: number;
  globalPlayPos: number;
  finished: boolean;

  constructor(public sequence: number[], public timePerNote: number,
              public repetitions: number, public controlIndex: number,
              public lastValue: number) {
    this.monoGroups = [controlIndex.toString()];
  }

  trigger(velocity: number, time: number) {
    this.globalPlayPos = -1;
    this.startTime = time;
    this.finished = false;
  }

  hasFinished = () => this.finished;

  play(output: WebMidi.MIDIOutput, time: number) {
    const newGlobalPlayPos = Math.floor((time - this.startTime) / this.timePerNote);

    if (newGlobalPlayPos >= this.sequence.length * this.repetitions) {
      const controlMessage = [0xB0, this.controlIndex, this.lastValue];
      output.send(controlMessage);
      this.finished = true;
    } else if (newGlobalPlayPos !== this.globalPlayPos) {
      this.globalPlayPos = newGlobalPlayPos;
      const localPlayPos = newGlobalPlayPos % this.sequence.length;
      const controlMessage = [0xB0, this.controlIndex, this.sequence[localPlayPos]];
      output.send(controlMessage);
      console.log('Send', controlMessage);
    }
  }

}
