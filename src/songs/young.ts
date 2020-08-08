import {ControlForwarder} from '../effects/control-forwarder';
import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterNoteOnByPort} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {EXPRESS_PEDAL, HAND_SONIC, MICRO_KORG, THROUGH_PORT,} from '../midi-ports';
import {applyEffects, Patch} from '../patch';
import {rangeMapper} from '../utils';

export function young(): Patch {
  const commonHarmonyDrum = {
    baseNoteInputFilter: filterNoteOnByPort(MICRO_KORG),
    resetDuration: 10_0000,
    noteDuration: 100,
    outputPortName: MICRO_KORG,
  };

  const effects = [
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(HAND_SONIC, 61),
      noteOffsets: [0]
    }),
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(HAND_SONIC, 62),
      noteOffsets: [7, 12, 19]
    }),
    new ControlForwarder(EXPRESS_PEDAL, MICRO_KORG, CUTOFF, rangeMapper([0, 127], [10, 127])),
  ];

  return {
    name: 'Young',
    midiProgram:  28, // a45
    drumProgram: 103,
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      applyEffects(midiEvent, midiOut, effects);

      if (midiEvent.comesFrom(EXPRESS_PEDAL) && midiEvent.message.type === 'ControlChange') {
        midiOut.pitchBendChange(THROUGH_PORT, midiEvent.message.value)
      }
    }
  }
}
