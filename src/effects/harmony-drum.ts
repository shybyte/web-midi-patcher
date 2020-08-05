import {MidiEvent} from '../midi-event';
import {MidiFilter} from '../midi-filter';
import {MidiMessageRaw} from '../midi-message';
import {MidiOut} from '../midi-out';
import {Effect} from '../patch';
import {waitMs} from '../utils';

export interface HarmonyDrumProps {
  baseNoteInputFilter: MidiFilter;
  trigger: MidiFilter;
  outputPortName: string;
  noteOffsets: number[];
  resetDuration?: number;
}

export class HarmonyDrum implements Effect {
  private baseNote = 50;
  private noteOffsetIndex = 0;
  private lastTimestamp = 0;

  constructor(private props: HarmonyDrumProps) {
  }

  async onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    if (this.props.baseNoteInputFilter(midiEvent) && midiEvent.message.type === 'NoteOn') {
      this.baseNote = midiEvent.message.note;
    } else if (this.props.trigger(midiEvent) && midiEvent.message.type === 'NoteOn') {
      if (this.props.resetDuration && midiEvent.receivedTime - this.lastTimestamp > this.props.resetDuration) {
        this.noteOffsetIndex = 0;
        console.log('Resetxcxx', midiEvent.receivedTime - this.lastTimestamp, this.props.resetDuration);
      }
      this.lastTimestamp = midiEvent.receivedTime;

      const note = this.baseNote + this.props.noteOffsets[this.noteOffsetIndex];
      console.log('Play Note!', note);
      this.noteOffsetIndex = (this.noteOffsetIndex + 1) % this.props.noteOffsets.length;
      midiOut.send(this.props.outputPortName, MidiMessageRaw.noteOn(note));
      await waitMs(100)
      midiOut.send(this.props.outputPortName, MidiMessageRaw.noteOff(note));
    }
  }
}
