import {Effect} from '../effect'

export class SweepDown implements Effect {
  monoGroups = ['74'];
  startValue = 127;
  value = 127;
  startTime: number;
  speed = 0.1;

  constructor(public controlIndex: number, public minValue: number) {
    this.monoGroups = [controlIndex.toString()];
  }

  trigger(velocity: number, time: number) {
    this.startValue = velocity;
    this.startTime = time;
  }

  hasFinished = () => this.value <= this.minValue;

  play(output: WebMidi.MIDIOutput, time: number) {
    this.value = Math.min(127, Math.max(this.minValue, this.startValue - (time - this.startTime) * this.speed));
    const data = [0xB0, this.controlIndex, this.value];
    console.log('Send', data);
    output.send(data);
  }
}
