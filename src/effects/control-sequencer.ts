import {MidiEvent} from '../midi-event';
import {MidiFilter} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';
import {waitMs} from '../utils';

export interface ControlSequencerProps {
  readonly trigger: MidiFilter;
  readonly outputPortName: string;
  readonly control: number,
  readonly values: number[];
  readonly step_duration: number;
  readonly outputValueMapper?: (value: number) => number;
}

export interface ControlSequencerPropsInternal extends ControlSequencerProps {
  readonly outputValueMapper: (value: number) => number;
}


export class ControlSequencer implements Effect {
  player?: ControlSequencePlayer;
  props: ControlSequencerPropsInternal;

  constructor(props: ControlSequencerProps) {
    this.props = {outputValueMapper: (x) => x, ...props};
  }

  set stepDuration(valueMs: number) {
    this.props = {...this.props, step_duration: valueMs}
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

type  ControlSequencePlayerProps = Pick<ControlSequencerPropsInternal,
  'outputPortName' | 'control' | 'values' | 'step_duration' | 'outputValueMapper'>


class ControlSequencePlayer {
  private valueIndex = 0;
  private stopped = false;

  constructor(private props: ControlSequencePlayerProps) {
  }

  async start(midiOut: MidiOut) {
    const {props} = this;
    while (this.valueIndex < props.values.length && !this.stopped) {
      const value = props.values[this.valueIndex];
      const outputValue = props.outputValueMapper(value);
      console.log('Send Value!', outputValue, value, this.valueIndex);
      this.valueIndex += 1;
      midiOut.controlChange(props.outputPortName, props.control, outputValue);
      if (this.valueIndex < props.values.length) {
        await waitMs(this.props.step_duration);
      }
    }
  }

  stop() {
    this.stopped = true;
  }
}
