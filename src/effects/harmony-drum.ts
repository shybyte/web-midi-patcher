import {MidiEvent} from '../midi-event';
import {MidiFilter} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {MidiNote, midiNoteToString} from '../midi_notes';
import {Effect} from '../patch';
import {waitMs} from '../utils';

export interface HarmonyDrumProps {
  baseNoteInputFilter: MidiFilter;
  getBaseNote?: (midiEvent: MidiEvent) => MidiNote | undefined;
  trigger: MidiFilter;
  outputPortName: string;
  noteOffsets: number[];

  /**
   * undefined or 0 means playing until note-off inpit event
   */
  noteDuration?: number;

  resetDuration?: number;
  resetFilter?: MidiFilter;
}

export class HarmonyDrum implements Effect {
  private baseNote = 50;
  private noteOffsetIndex = 0;
  private lastTimestamp = 0;
  private pressedNote = 0;

  constructor(private props: HarmonyDrumProps) {
  }

  async onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const props = this.props;

    if (props.resetFilter && props.resetFilter(midiEvent)) {
      console.log('HarmonyDrum: reset');
      this.noteOffsetIndex = 0;
    }

    if (props.getBaseNote) {
      const baseNote = props.getBaseNote(midiEvent);
      if (baseNote && this.baseNote !== baseNote) {
        this.baseNote = baseNote;
        console.log('HarmonyDrum: New baseNote:', this.baseNote);
      }
    }

    if (props.baseNoteInputFilter(midiEvent) && midiEvent.message.type === 'NoteOn') {
      this.baseNote = midiEvent.message.note;
      console.log('HarmonyDrum: New baseNote:', this.baseNote, midiNoteToString(this.baseNote));
    } else if (props.trigger(midiEvent) && midiEvent.message.type === 'NoteOn') {
      console.log('HarmonyDrum: triggered', midiEvent);
      if (props.resetDuration && midiEvent.receivedTime - this.lastTimestamp > props.resetDuration) {
        this.noteOffsetIndex = 0;
      }
      this.lastTimestamp = midiEvent.receivedTime;

      const playingNote = this.baseNote + props.noteOffsets[this.noteOffsetIndex];
      console.log('HarmonyDrum: Play Note!', playingNote);
      this.noteOffsetIndex = (this.noteOffsetIndex + 1) % props.noteOffsets.length;
      midiOut.noteOn(props.outputPortName, playingNote);
      if (props.noteDuration) {
        await waitMs(props.noteDuration);
        console.log('HarmonyDrum: Stop note ', playingNote);
        midiOut.noteOff(props.outputPortName, playingNote);
      } else {
        this.pressedNote = playingNote;
      }
    } else if (props.trigger(midiEvent) && !props.noteDuration && midiEvent.message.type === 'NoteOff') {
      console.log('HarmonyDrum: Stop note ', this.pressedNote);
      midiOut.noteOff(props.outputPortName, this.pressedNote);
    }
  }
}
