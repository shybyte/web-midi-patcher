import {MidiNote} from "./midi_notes";
import {MidiSequenceStep} from "./effects/midi-sequence-drum";
import {times} from "./utils";

export interface ArpeggioProps {
  channel: number;
  durationTicks: number;
  delayTicks: number;
}

export function arpeggioUp(notes: MidiNote[], octaves: number, props: ArpeggioProps): MidiSequenceStep[] {
  return times(octaves, (octave) =>
    arpeggio(notes.map(note => note + octave * 12), props)
  ).flat();
}

export function arpeggioUpDown(notes: MidiNote[], octaves: number, props: ArpeggioProps): MidiSequenceStep[] {
  const upNotes = times(octaves, (octave) =>
    notes.map(note => note + octave * 12)
  ).flat();
  const downNotes = [...upNotes].reverse();
  upNotes.pop();
  downNotes.pop();
  return arpeggio(upNotes.concat(downNotes), props);
}


export function arpeggio(notes: MidiNote[], props: ArpeggioProps): MidiSequenceStep[] {
  return notes.flatMap(note => ([
    {type: 'NoteOn', note: note, channel: props.channel, velocity: 100},
    {ticks: props.durationTicks},
    {type: 'NoteOff', note: note, channel: props.channel, velocity: 100},
    {ticks: props.delayTicks},
  ]))
}