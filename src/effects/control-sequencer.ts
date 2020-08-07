import {MidiEvent} from '../midi-event';
import {MidiFilter} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';
import {waitMs} from '../utils';

export interface ControlSequencerProps {
  trigger: MidiFilter;
  outputPortName: string;
  control: number,
  values: number[];
  step_duration: number;
}

export class ControlSequencer implements Effect {
  player?: ControlSequencePlayer;

  constructor(private props: ControlSequencerProps) {
  }

  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const props = this.props;

    if (!(props.trigger(midiEvent))) {
      return;
    }

    if (this.player) {
      this.player.stop();
    }

    this.player = new ControlSequencePlayer(props);
    this.player.start(midiOut);
  }
}

type  ControlSequencePlayerProps = Pick<ControlSequencerProps,
  'outputPortName' | 'control' | 'values' | 'step_duration'>


class ControlSequencePlayer {
  private valueIndex = 0;
  private stopped = false;

  constructor(private props: ControlSequencePlayerProps) {
  }

  async start(midiOut: MidiOut) {
    const {props} = this;
    while (this.valueIndex < props.values.length && !this.stopped) {
      const value = props.values[this.valueIndex];
      console.log('Send Value!', value, this.valueIndex);
      this.valueIndex += 1;
      midiOut.controlChange(props.outputPortName, props.control, value);
      if (this.valueIndex < props.values.length) {
        await waitMs(this.props.step_duration);
      }
    }
  }

  stop() {
    this.stopped = true;
  }
}
