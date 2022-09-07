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
  harmonyNoteTriggerDevice: string;
  lastHarmonyTriggerFilter?: MidiFilter;
  harmonies: MidiSequenceDrumHarmony[];
  tickDuration: number;
}

export class MidiSequenceDrum implements Effect {
  private currentSequencePlayer: MultiMidiSequencePlayer | undefined;
  lastTriggeredTime: number = 0;
  private currentHarmony?: MidiSequenceDrumHarmony;
  private currentHarmonyNoteSequence: MidiSequence | undefined;
  private harmonyNoteSequencePlayer: MultiMidiSequencePlayer | undefined;
  private currentDronePlayer: MultiMidiSequencePlayer | undefined;

  constructor(private props: MidiSequenceDrumProps) {
  }

  set tickDuration(valueMs: number) {
    this.props = {...this.props, tickDuration: valueMs};
    if (this.currentSequencePlayer) {
      this.currentSequencePlayer.tickDuration = valueMs;
    }
    if (this.currentDronePlayer)  {
      this.currentDronePlayer.tickDuration = valueMs;
    }
    if (this.harmonyNoteSequencePlayer)  {
      this.harmonyNoteSequencePlayer.tickDuration = valueMs;
    }
  }

  onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
    const midiMessage = midiEvent.message;
    // console.log('midiEvent', midiEvent, midiMessage);
    const lastHarmonyTriggered = this.props.lastHarmonyTriggerFilter && this.props.lastHarmonyTriggerFilter(midiEvent);
    if (isRealNoteOn(midiMessage) && (this.props.triggerFilter(midiEvent) || lastHarmonyTriggered)
    ) {
      const harmony = lastHarmonyTriggered && (Date.now() - this.lastTriggeredTime > 100)
        ? this.currentHarmony
        : this.props.harmonies.find(it =>
          typeof it.harmonyTrigger === 'number'
            ? it.harmonyTrigger === midiMessage.note
            : it.harmonyTrigger(midiEvent)
        );

      if (harmony) {
        this.lastTriggeredTime = Date.now();

        if (this.currentHarmony !== harmony) {
          if (this.currentSequencePlayer) {
            this.currentSequencePlayer.stop(midiOut);
          }

          this.currentSequencePlayer = new MultiMidiSequencePlayer({
            notes: 'sequences' in harmony.baseSequence ? harmony.baseSequence : {sequences: [harmony.baseSequence]},
            tickDurationMs: this.props.tickDuration,
            outputPortName: this.props.outputDevice
          });

          this.currentDronePlayer?.stop(midiOut);
          const droneSequence = harmony?.droneSequence;
          if (droneSequence) {
            this.currentDronePlayer = new MultiMidiSequencePlayer({
              notes: 'sequences' in droneSequence ? droneSequence : {sequences: [droneSequence]},
              tickDurationMs: this.props.tickDuration,
              outputPortName: this.props.outputDevice
            });
            this.currentDronePlayer.start(midiOut);
          } else {
            this.currentDronePlayer = undefined;
          }
        }

        this.currentHarmony = harmony;
        this.currentSequencePlayer!.start(midiOut);
      }
    }

    if (midiEvent.comesFrom(this.props.harmonyNoteTriggerDevice) && isRealNoteOn(midiMessage)) {
      const harmonyNotes = this.currentHarmony && this.currentHarmony.harmonyNotesByTriggerNode[midiMessage.note];
      if (harmonyNotes) {
        if (this.currentHarmonyNoteSequence !== harmonyNotes) {
          this.currentHarmonyNoteSequence = harmonyNotes;
          this.harmonyNoteSequencePlayer = new MultiMidiSequencePlayer({
            notes: 'sequences' in harmonyNotes ? harmonyNotes : {sequences: [harmonyNotes]},
            tickDurationMs: this.props.tickDuration,
            outputPortName: this.props.outputDevice
          })
        }
        this.harmonyNoteSequencePlayer?.start(midiOut);
      }
    }
  }
}

export function msHarmony(
  harmonyTrigger: HarmonyTrigger,
  baseSequence: MidiSequence,
  harmonyNotesByTriggerNode: Dictionary<number, MidiSequence> = {},
  droneSequence?: MidiSequence,
): MidiSequenceDrumHarmony {
  return {
    harmonyTrigger: harmonyTrigger, baseSequence, harmonyNotesByTriggerNode, droneSequence
  }
}


export type HarmonyTrigger = MidiNote | MidiFilter;

export interface MidiSequenceDrumHarmony {
  harmonyTrigger: HarmonyTrigger;
  baseSequence: MidiSequence;
  droneSequence?: MidiSequence;
  harmonyNotesByTriggerNode: Dictionary<number, MidiSequence>
}


export type MidiSequence = MidiSequenceStep[] | MultiSequence;

export interface MultiSequence {
  sequences: MidiSequenceStep[][];
}


interface MultiMidiSequencePlayerProps {
  notes: MultiSequence;
  outputPortName: string;
  tickDurationMs: number;
}

class MultiMidiSequencePlayer {
  private currentSequencePlayer: SingleMidiSequencePlayer | undefined;
  private baseSequenceIndex = 0;

  constructor(private props: MultiMidiSequencePlayerProps) {
  }

  set tickDuration(valueMs: number) {
    this.props = {...this.props, tickDurationMs: valueMs};
    if (this.currentSequencePlayer) {
      this.currentSequencePlayer.tickDuration = valueMs;
    }
  }

  async start(midiOut: MidiOut): Promise<void> {
    if (this.currentSequencePlayer) {
      this.currentSequencePlayer.stop(midiOut);
    }

    const baseSequence: MidiSequenceStep[] = this.props.notes.sequences[this.baseSequenceIndex % this.props.notes.sequences.length];

    this.currentSequencePlayer = new SingleMidiSequencePlayer({
      notes: baseSequence,
      tickDurationMs: this.props.tickDurationMs,
      outputPortName: this.props.outputPortName
    });
    this.currentSequencePlayer.start(midiOut);

    this.baseSequenceIndex += 1;
  }

  stop(midiOut: MidiOut): void {
    if (this.currentSequencePlayer) {
      this.currentSequencePlayer.stop(midiOut);
    }
  }

}


export interface SingleMidiSequencePlayerProps {
  notes: MidiSequenceStep[];
  outputPortName: string;
  tickDurationMs: number;
}

class SingleMidiSequencePlayer {
  private noteIndex = 0;
  private stopped = false;
  private startedNotes: Map<String, NoteOn> = new Map();

  constructor(private props: SingleMidiSequencePlayerProps) {
  }

  set tickDuration(valueMs: number) {
    this.props = {...this.props, tickDurationMs: valueMs};
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