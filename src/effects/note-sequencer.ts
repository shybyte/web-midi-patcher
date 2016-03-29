import {Effect} from '../effect'

export class NoteSequencer implements Effect {
  monoGroups = ['note'];

  startTime: number;
  globalPlayPos: number;
  finished: boolean;

  constructor(public sequence: number[], public timePerNote: number, public repetitions: number) {
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
      this.finished = true;
    } else if (newGlobalPlayPos !== this.globalPlayPos) {
      this.globalPlayPos = newGlobalPlayPos;
      const localPlayPos = newGlobalPlayPos % this.sequence.length;
      const noteOnMessage = [0x90, this.sequence[localPlayPos], 0x7f];
      output.send(noteOnMessage);
      output.send([0x80, this.sequence[localPlayPos], 0x40], window.performance.now() + 10.0);
      console.log('Send', noteOnMessage);
    }
  }

}
