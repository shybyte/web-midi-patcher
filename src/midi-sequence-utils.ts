import {MidiSequenceStep} from "./effects/midi-sequence-drum";
import {Dictionary, mergeByLength} from "./utils";
import {MidiNote} from "./midi_notes";

export function replaceNotes(
  midiSequence: MidiSequenceStep[],
  replacementMap: Dictionary<MidiNote, MidiNote>,
): MidiSequenceStep[] {
  return midiSequence.map(step => {
    if ('type' in step && (step.type === 'NoteOn' || step.type === 'NoteOff')) {
      const replacementNote = replacementMap[step.note];
      if (replacementNote) {
        return {...step, note: replacementNote}
      }
    }
    return step;
  });
}

export function setOutputDevice(
  midiSequence: MidiSequenceStep[],
  outputDevice: string,
): MidiSequenceStep[] {
  return midiSequence.map(step => 'type' in step ? {...step, outputDevice: outputDevice} : step);
}

export function mergeMidiSequences(seq1: MidiSequenceStep[], seq2: MidiSequenceStep[]): MidiSequenceStep[] {
  return mergeByLength(seq1, seq2, step => 'type' in step ? 0 : step.ticks);
}

export function divideTicks(midiSequence: MidiSequenceStep[], divisor: number): MidiSequenceStep[] {
  return midiSequence.map(step => 'type' in step ? step : {ticks: step.ticks / divisor});
}