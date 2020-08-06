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
  private playingNote = 0;

  constructor(private props: HarmonyDrumProps) {
  }

  async onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const props = this.props;
    if (props.baseNoteInputFilter(midiEvent) && midiEvent.message.type === 'NoteOn') {
      this.baseNote = midiEvent.message.note;
    } else if (props.trigger(midiEvent) && midiEvent.message.type === 'NoteOn') {
      const needsResetByFilter = props.resetFilter && props.resetFilter(midiEvent);
      const needsTimeByTime = props.resetDuration && midiEvent.receivedTime - this.lastTimestamp > props.resetDuration;
      if (needsResetByFilter && needsTimeByTime) {
        this.noteOffsetIndex = 0;
      }
      this.lastTimestamp = midiEvent.receivedTime;

      this.playingNote = this.baseNote + props.noteOffsets[this.noteOffsetIndex];
      console.log('Play Note!', this.playingNote);
      this.noteOffsetIndex = (this.noteOffsetIndex + 1) % props.noteOffsets.length;
      midiOut.send(props.outputPortName, MidiMessageRaw.noteOn(this.playingNote));
      if (props.noteDuration) {
        await waitMs(props.noteDuration);
        midiOut.send(props.outputPortName, MidiMessageRaw.noteOff(this.playingNote));
      }
    } else if (props.trigger(midiEvent) && !props.noteDuration && midiEvent.message.type === 'NoteOff') {
      midiOut.send(props.outputPortName, MidiMessageRaw.noteOff(this.playingNote));
    }
  }
}
