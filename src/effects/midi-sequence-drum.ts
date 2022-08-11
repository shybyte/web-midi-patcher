import {MidiEvent} from '../midi-event';
import {MidiOut} from '../midi-out';
import {MidiNote, midiNoteToString} from '../midi_notes';
import {Effect} from '../patch';
import {Dictionary, waitMs} from '../utils';
import {isRealNoteOn, MidiMessage, NoteOff, NoteOn} from "../midi-message";
import {MidiFilter} from "../midi-filter";

export interface MidiSequenceDrumProps {
  outputDevice: string;
  triggerFilter: MidiFilter;
  lastHarmonyTriggerFilter?: MidiFilter;
  harmonies: MidiSequenceDrumHarmony[];
  tickDuration: number;
  note_duration?: number;
  harmonyNoteDuration?: number;
  harmonyNoteChannel?: number;
}

const DRONE_CHANNEL = 1;

export class MidiSequenceDrum implements Effect {
  private currentSequencePlayer: MidiSequencePlayer | undefined;
  private currentHarmony?: MidiSequenceDrumHarmony;
  private currentHarmonyNoteIndex = 0;
  private currentDroneNote: number | undefined = undefined;

  constructor(private props: MidiSequenceDrumProps) {
  }

  set tickDuration(valueMs: number) {
    this.props = {...this.props, tickDuration: valueMs};
  }

  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const midiMessage = midiEvent.message;
    // console.log('midiEvent', midiEvent, midiMessage);
    if (isRealNoteOn(midiMessage) &&
      (
        this.props.triggerFilter(midiEvent) ||
        this.props.lastHarmonyTriggerFilter && this.props.lastHarmonyTriggerFilter(midiEvent)
      )
    ) {
      console.log('triggerNote', midiNoteToString(midiMessage.note));

      const harmony = this.props.triggerFilter(midiEvent)
        ? this.props.harmonies.find(it => it.triggerNote === midiMessage.note)
        : this.currentHarmony;
      if (harmony) {
        if (this.currentSequencePlayer) {
          this.currentSequencePlayer.stop(midiOut);
        }

        this.currentHarmony = harmony;

        console.log('harmony.baseSequence', harmony.baseSequence, 'tickDuration', this.props.tickDuration);

        this.currentSequencePlayer = new MidiSequencePlayer({
          notes: harmony.baseSequence,
          tickDurationMs: this.props.tickDuration,
          outputPortName: this.props.outputDevice
        });
        this.currentSequencePlayer.start(midiOut);
      }

      const harmonyNotes = this.currentHarmony && this.currentHarmony.harmonyNotesByTriggerNode[midiMessage.note];
      if (harmonyNotes) {
        const harmonyNote = harmonyNotes[this.currentHarmonyNoteIndex % harmonyNotes.length];
        playNoteAndNoteOff(midiOut, this.props.outputDevice, harmonyNote, this.props.harmonyNoteDuration ?? 200, this.props.harmonyNoteChannel ?? 0);
        this.currentHarmonyNoteIndex += 1
      }

      const droneNote = harmony?.droneNote;
      if (droneNote && droneNote !== this.currentDroneNote) {
        if (this.currentDroneNote) {
          this.stopDrone(midiOut);
        }
        midiOut.noteOn(this.props.outputDevice, droneNote, 127, DRONE_CHANNEL);
        this.currentDroneNote = droneNote;
      }

      if (harmony && !droneNote && this.currentDroneNote) {
        this.stopDrone(midiOut);
      }


    }
  }

  stopDrone(midiOut: MidiOut) {
    if (this.currentDroneNote) {
      midiOut.noteOff(this.props.outputDevice, this.currentDroneNote, 127, DRONE_CHANNEL);
      this.currentDroneNote = undefined;
    }
  }
}

async function playNoteAndNoteOff(midiOut: MidiOut, outputPortName: string, note: MidiNote, durationMs: number, channel = 0) {
  midiOut.noteOn(outputPortName, note, 127, channel);
  await waitMs(durationMs)
  midiOut.noteOff(outputPortName, note, 127, channel);
}

export function msHarmony(
  triggerNote: MidiNote,
  baseSequence: MidiSequenceStep[],
  harmonyNotesByTriggerNode: Dictionary<number, MidiNote[]> = {},
  droneNote?: MidiNote,
): MidiSequenceDrumHarmony {
  return {
    triggerNote, baseSequence, harmonyNotesByTriggerNode, droneNote
  }
}

export interface MidiSequenceDrumHarmony {
  triggerNote: MidiNote;
  baseSequence: MidiSequenceStep[];
  droneNote?: MidiNote;
  harmonyNotesByTriggerNode: Dictionary<number, MidiNote[]>
}


export interface NoteSequencePlayerProps {
  notes: MidiSequenceStep[];
  outputPortName: string;
  tickDurationMs: number;
}

class MidiSequencePlayer {
  private noteIndex = 0;
  private stopped = false;
  private startedNotes: Map<String, NoteOn> = new Map();

  constructor(private props: NoteSequencePlayerProps) {
  }

  async start(midiOut: MidiOut) {
    const {props} = this;
    while (this.noteIndex < props.notes.length && !this.stopped) {
      const note = this.props.notes[this.noteIndex];
      // console.log('Send Note!', outputValue, note, this.noteIndex);
      this.noteIndex += 1;
      if ('ticks' in note) {
        await waitMs(note.ticks * this.props.tickDurationMs);
      } else {
        const outputDevice = note.outputDevice || this.props.outputPortName;
        midiOut.send(outputDevice, note);
        if (note.type === 'NoteOn') {
          this.startedNotes.set(makeNoteOnKey(outputDevice, note), note);
        } else if (note.type === 'NoteOff') {
          this.startedNotes.delete(makeNoteOnKey(outputDevice, note));
        }
      }
    }
  }

  stop(midiOut: MidiOut) {
    this.stopped = true;
    for (const note of this.startedNotes.values()) {
      midiOut.noteOff(this.props.outputPortName, note.note, 0, note.channel);
    }
  }
}

function makeNoteOnKey(outputDevice: string, noteOn: NoteOn | NoteOff) {
  return outputDevice + '_' + noteOn.note + '_' + noteOn.channel;
}

export interface Pause {
  ticks: number;
}

export type MidiSequenceStep = OutputMidiMessage | Pause;

export type OutputMidiMessage = (MidiMessage & { outputDevice?: string });