import {MidiEvent} from '../midi-event';
import {MidiFilter} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';

export interface ControlSequenceStepperProps {
  trigger: MidiFilter;
  resetFilter: MidiFilter;
  outputPortName: string;
  control: number,
  values: number[];
}

export class ControlSequenceStepper implements Effect {
  private valueIndex = 0;

  constructor(private props: ControlSequenceStepperProps) {
  }

  async onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const props = this.props;

    if (!(props.trigger(midiEvent))) {
      return;
    }

    if (props.resetFilter(midiEvent)) {
      this.valueIndex = 0;
    }

    const value = props.values[this.valueIndex];
    console.log('Send Value!', value);
    this.valueIndex = (this.valueIndex + 1) % props.values.length;
    midiOut.controlChange(props.outputPortName, props.control, value);
  }
}
