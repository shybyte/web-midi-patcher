import {MidiSequenceStep} from "./effects/midi-sequence-drum";
import {Dictionary} from "./utils";
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