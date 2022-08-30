import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {MOD} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterByNote, filterByNoteInRange, filterByNoteOn, filterByNoteOnInRange} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, THROUGH_PORT} from '../midi-ports';
import {A4, C5} from '../midi_notes';
import {applyEffects, Patch} from '../patch';
import {rangeMapper} from '../utils';
import {NoteForwarder} from "../effects/note-forwarder";
import {KEYBOARD_IN} from "../config";

export function system(): Patch {
  const commonHarmonyDrum = {
    baseNoteInputFilter: filterByNoteOnInRange(HAND_SONIC, [10, 127]),
    resetDuration: 2_000,
    outputPortName: THROUGH_PORT,
  };

  const noteForwarder = new NoteForwarder((event) =>
      (event.message.type === 'NoteOn' || event.message.type === 'NoteOff') &&
      event.comesFrom(KEYBOARD_IN) && event.message.note >= C5
    , THROUGH_PORT,
    (message) => ({...message, channel: 2})
  );


  const effects = [
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterByNote(HAND_SONIC, 4),
      noteOffsets: [12, 19],
      resetFilter: filterByNoteOn(HAND_SONIC, A4)
    }),
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterByNote(HAND_SONIC, 5),
      noteOffsets: [19]
    }),
    new ControlForwarder(EXPRESS_PEDAL, THROUGH_PORT, MOD, rangeMapper([0, 127], [10, 127])),
    noteForwarder
  ];

  const forwardToSynth = filterByNoteInRange(HAND_SONIC, [10, 127]);

  return {
    name: 'System',
    midiProgram: 51, // A74
    drumProgram: 106,
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);
      console.log('midiEvent:', midiEvent)
      if (forwardToSynth(midiEvent)) {
        midiOut.send(THROUGH_PORT, midiEvent.message);
      }
    }
  }
}
