import {assert, describe, test} from 'vitest';
import {isPause, mergeMidiSequences} from "../midi-sequence-utils";
import {MidiSequenceStep} from "../effects/midi-sequence-drum";
import {MidiNote} from "../midi_notes";
import {NoteOn} from "../midi-message";

function noteOn(note: MidiNote): NoteOn {
  return {type: 'NoteOn', note: note, velocity: 127, channel: 0};
}

function getShortNotation(midiSeq: MidiSequenceStep[]): string {
  return midiSeq.map(step =>
    isPause(step)
      ? 'P' + step.ticks
      : ('N' + (step as NoteOn).note)
  ).join(' ');
}

describe('mergeMidiSequences', () => {
  test('2 empty lists', () => {
    assert.deepEqual(
      mergeMidiSequences([], []),
      []
    );
  });

  test('1 empty list', () => {
    const dummySeq = [noteOn(1)];
    assert.deepEqual(mergeMidiSequences(dummySeq, []), dummySeq);
    assert.deepEqual(mergeMidiSequences([], dummySeq), dummySeq);
  });

  test('2 lists without ticks', () => {
    const dummySeq1 = [noteOn(11), noteOn(12)];
    const dummySeq2 = [noteOn(21), noteOn(22)];
    assert.deepEqual(mergeMidiSequences(dummySeq1, dummySeq2), dummySeq1.concat(dummySeq2));
  });

  test('2 lists with ticks', () => {
    const dummySeq1: MidiSequenceStep[] = [noteOn(11), {ticks: 1}, noteOn(12)];
    const dummySeq2: MidiSequenceStep[] = [noteOn(21), {ticks: 2}, noteOn(22)];
    assert.equal(
      getShortNotation(mergeMidiSequences(dummySeq1, dummySeq2)),
      'N11 N21 P1 N12 P1 N22'
    );
  });

  test('2 lists ticks at end', () => {
    const dummySeq1: MidiSequenceStep[] = [noteOn(11), {ticks: 1}];
    const dummySeq2: MidiSequenceStep[] = [noteOn(21), {ticks: 2}];
    assert.equal(
      getShortNotation(mergeMidiSequences(dummySeq1, dummySeq2)),
      'N11 N21 P2'
    );
  });
})

