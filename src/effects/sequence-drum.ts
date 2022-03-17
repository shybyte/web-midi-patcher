import {MidiEvent} from '../midi-event';
import {MidiOut} from '../midi-out';
import {MidiNote, midiNoteToString} from '../midi_notes';
import {Effect} from '../patch';
import {Dictionary, times, waitMs} from '../utils';

export interface SequenceDrumProps {
  drumInputDevice: string;
  outputDevice: string;
  harmonies: Harmony[];
}

export class SequenceDrum implements Effect {
  private currentSequencePlayer: NoteSequencePlayer | undefined;

  constructor(private props: SequenceDrumProps) {
  }

  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const midiMessage = midiEvent.message;
    console.log('midiEvent', midiEvent, midiMessage);
    if (midiMessage.type === 'NoteOn' && midiEvent.comesFrom(this.props.drumInputDevice)) {
      console.log('triggerNote', midiNoteToString(midiMessage.note));
      const harmony = this.props.harmonies.find(it => it.triggerNote === midiMessage.note);
      if (harmony) {
        if (this.currentSequencePlayer) {
          this.currentSequencePlayer.stop();
        }

        console.log('harmony.baseSequence', harmony.baseSequence);

        this.currentSequencePlayer = new NoteSequencePlayer({
          notes: harmony.baseSequence,
          note_duration: 20,
          step_duration: 130,
          outputPortName: this.props.outputDevice
        });
        this.currentSequencePlayer.start(midiOut);
      }
    }
  }
}


export function octaveUpSequence(baseNote: MidiNote, n: number = 4): MidiNote[] {
  return times(n, (i) => baseNote + 12 * i);
}

export function repeatSequence<T>(array: T[], n: number): T[] {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(...array);
  }
  return result;
}

export function harmony(triggerNote: MidiNote, baseSequence: MidiNote[], harmonyNotesByTriggerNode: Dictionary<number, MidiNote[]> = {}): Harmony {
  return {
    triggerNote, baseSequence, harmonyNotesByTriggerNode
  }
}

export interface Harmony {
  triggerNote: MidiNote;
  baseSequence: MidiNote[];
  harmonyNotesByTriggerNode: Dictionary<number, MidiNote[]>
}


export interface NoteSequencePlayerProps {
  notes: MidiNote[];
  outputPortName: string;
  note_duration: number;
  step_duration: number;
}

class NoteSequencePlayer {
  private noteIndex = 0;
  private stopped = false;

  constructor(private props: NoteSequencePlayerProps) {
  }

  async start(midiOut: MidiOut) {
    const {props} = this;
    while (this.noteIndex < props.notes.length && !this.stopped) {
      const note = this.props.notes[this.noteIndex];
      // console.log('Send Note!', outputValue, note, this.noteIndex);
      this.noteIndex += 1;
      midiOut.noteOn(props.outputPortName, note);
      await waitMs(this.props.note_duration)
      midiOut.noteOff(props.outputPortName, note);
      if (this.noteIndex < props.notes.length) {
        await waitMs(this.props.step_duration - this.props.note_duration);
      }
    }
  }

  stop() {
    this.stopped = true;
  }
}
