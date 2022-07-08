import {MidiEvent} from '../midi-event';
import {MidiFilter} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';

export interface ControlSequenceStepperProps {
  trigger: MidiFilter;
  resetFilter: MidiFilter;
  resetInstantly?: boolean;
  outputPortName: string;
  control: number,
  values: number[];
  channel?: number;
}

export class ControlSequenceStepper implements Effect {
  private valueIndex = 0;

  constructor(private props: ControlSequenceStepperProps) {
  }

  async onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const props = this.props;

    if (props.resetFilter(midiEvent)) {
      this.valueIndex = 0;
      if (this.props.resetInstantly) {
        this.sendCurrentValue(midiOut);
      }
    }

    if (props.trigger(midiEvent)) {
      this.sendCurrentValue(midiOut);
      this.valueIndex = (this.valueIndex + 1) % props.values.length;
    }
  }

  sendCurrentValue(midiOut: MidiOut) {
    const props = this.props;
    const value = props.values[this.valueIndex];
    console.log('Send Value!', value);
    midiOut.controlChange(props.outputPortName, props.control, value, this.props.channel ?? 0);
  }

}
