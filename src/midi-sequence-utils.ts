import {MidiSequenceStep, OutputMidiMessage, Pause} from "./effects/midi-sequence-drum";
import {Dictionary, merge} from "./utils";
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
  const mergedMessagesWithPos = merge(getOutputMidiMessagesWithPos(seq1), getOutputMidiMessagesWithPos(seq2), step => step.pos);
  const result = convertPosToPauses(mergedMessagesWithPos);

  const missingPauseAtEnd = Math.max(getSeqLength(seq1), getSeqLength(seq2)) - getSeqLength(result);
  if (missingPauseAtEnd > 0) {
    result.push({ticks: missingPauseAtEnd})
  }

  return result;
}

function getSeqLength(seq: MidiSequenceStep[]): number {
  return seq.reduce((sum, step) => isPause(step) ? sum + step.ticks : sum, 0);
}

function convertPosToPauses(input: OutputMidiMessageWithPosition[]): MidiSequenceStep[] {
  return input.flatMap((messageWithPos, i) => {
    const prevPosition = input[i - 1]?.pos ?? 0;
    const positionDelta = messageWithPos.pos - prevPosition;
    return positionDelta > 0
      ? [{ticks: positionDelta}, messageWithPos.message]
      : [messageWithPos.message];
  });
}

interface OutputMidiMessageWithPosition {
  message: OutputMidiMessage;
  pos: number;
}

export function getOutputMidiMessagesWithPos(array: MidiSequenceStep[]): OutputMidiMessageWithPosition[] {
  let pos = 0;
  return array.flatMap(step => {
    if (isPause(step)) {
      pos += step.ticks
      return [];
    } else {
      return [{message: step, pos}];
    }
  });
}

export function isPause(step: MidiSequenceStep): step is Pause {
  return 'ticks' in step;
}

export function divideTicks(midiSequence: MidiSequenceStep[], divisor: number): MidiSequenceStep[] {
  return midiSequence.map(step => 'type' in step ? step : {ticks: step.ticks / divisor});
}