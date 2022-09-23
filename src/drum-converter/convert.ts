import {MidiSequence, MidiSequenceStep} from "../effects/midi-sequence-drum";

export interface ConvertedPattern {
  size: number;
  midiSequence: MidiSequenceStep[];
}

export function convertH2PatternToMidiSequence(h2Pattern: string): ConvertedPattern {
  const parser = new DOMParser();
  const document = parser.parseFromString(h2Pattern.trim(), 'application/xml');
  const notesNodeList = document.querySelectorAll('note')!;
  const notes = [...notesNodeList].map(parseNote);
  const midiSequence = notes.flatMap((note, i) => {
    const noteOnOff: MidiSequenceStep[] = [
      {type: 'NoteOn', note: note.instrument, channel: 0, velocity: note.velocity * 127},
      {type: 'NoteOff', note: note.instrument, channel: 0, velocity: 0},
    ];
    const prevPosition = notes[i - 1]?.position ?? 0;
    const positionDelta = note.position - prevPosition;
    return positionDelta > 0
      ? [{ticks: positionDelta}, ...noteOnOff]
      : noteOnOff;
  });
  const size = getElementAsNumber(document, 'size');
  const remainingTicks = size - notes[notes.length - 1].position;
  midiSequence.push({ticks: remainingTicks});
  return {
    size: size,
    midiSequence: midiSequence
  };
}

interface H2Note {
  position: number;
  velocity: number;
  instrument: number;
}

/**
 * @param element
 * <note>
 *   <position>0</position>
 *   <velocity>0.8</velocity>
 *   <instrument>0</instrument>
 * </note>
 */
function parseNote(element: Element): H2Note {
  return {
    position: getElementAsNumber(element, 'position'),
    velocity: getElementAsNumber(element, 'velocity'),
    instrument: getElementAsNumber(element, 'instrument'),
  };
}


function getElementAsNumber(root: Element | Document, selector: string): number {
  return parseFloat(root.querySelector(selector)!.textContent!);
}