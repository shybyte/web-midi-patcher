import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {NoteSequencer} from '../effects/note-sequencer';
import {CUTOFF} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterByNote, filterByNoteOn, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, NTS, THROUGH_PORT, VMPK,} from '../midi-ports';
import {
  A2,
  A3,
  A4,
  A5,
  A6,
  B2,
  B3,
  B4,
  B5, C3, C4,
  C5,
  D3,
  D4,
  D5, E5,
  F3,
  F4, F5, G3,
  G4,
  G5, H4,
  MidiNote,
  midiNoteToString
} from '../midi_notes';
import {applyEffects, Patch, PatchProps} from '../patch';
import {Dictionary, rangeMapper, times, waitMs} from '../utils';

// const DRUM_INPUT_DEVICE = VMPK;
const PEDAL_INPUT_DEVICE = VMPK;
// const OUT_DEVICE = THROUGH_PORT;
const DRUM_INPUT_DEVICE = HAND_SONIC;
// const PEDAL_INPUT_DEVICE = EXPRESS_PEDAL;
const OUT_DEVICE = NTS;

export function sequenceDrums(props: PatchProps): Patch {
  const harmonies: Harmony[] = [
    harmony(C5, repeatSequence(octaveUpSequence(A2), 4)),
    harmony(D5, repeatSequence(octaveUpSequence(D3), 4)),
    harmony(E5, repeatSequence(octaveUpSequence(F3), 4)),
    harmony(F5, repeatSequence(octaveUpSequence(G3), 4)),
  ];
  let currentSequencePlayer: NoteSequencePlayer | undefined;

  return {
    name: 'Sequence-Drums',
    midiProgram: 28, // a45
    drumProgram: 110,
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      const midiMessage = midiEvent.message;
      console.log('midiEvent', midiMessage);
      if (midiMessage.type === 'NoteOn' && midiEvent.comesFrom(DRUM_INPUT_DEVICE)) {
        console.log('triggerNote', midiNoteToString(midiMessage.note));
        const harmony = harmonies.find(it => it.triggerNote === midiMessage.note);
        if (harmony) {
          if (currentSequencePlayer) {
            currentSequencePlayer.stop();
          }

          console.log('harmony.baseSequence', harmony.baseSequence);

          currentSequencePlayer = new NoteSequencePlayer({
            notes: harmony.baseSequence,
            note_duration: 20,
            step_duration: 130,
            outputPortName: OUT_DEVICE
          });
          currentSequencePlayer.start(midiOut);
          props.setStatusDisplayHtml(`Trigger: <span style="font-size: 40px">${midiNoteToString(harmony.baseSequence[0])}</span>`);
        }
      }
    }
  }
}

function octaveUpSequence(baseNote: MidiNote, n: number = 4): MidiNote[] {
  return times(n, (i) => baseNote + 12 * i);
}

function repeatSequence<T>(array: T[], n: number): T[] {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(...array);
  }
  return result;
}

function harmony(triggerNote: MidiNote, baseSequence: MidiNote[], harmonyNotesByTriggerNode: Dictionary<number, MidiNote[]> = {}): Harmony {
  return {
    triggerNote, baseSequence, harmonyNotesByTriggerNode
  }
}

interface Harmony {
  triggerNote: MidiNote;
  baseSequence: MidiNote[];
  harmonyNotesByTriggerNode: Dictionary<number, MidiNote[]>
}


interface NoteSequencePlayerProps {
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
