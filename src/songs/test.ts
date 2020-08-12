import {MidiEvent} from '../midi-event';
import {filterByNoteInRange} from '../midi-filter';
import {MidiOut} from '../midi-out';
import {HAND_SONIC, K_BOARD, THROUGH_PORT, VMPK} from '../midi-ports';
import {Patch} from '../patch';

export function test(): Patch {
  const forwardToSynth = filterByNoteInRange(VMPK, [10, 127]);

  return {
    name: 'Test',
    midiProgram: 1, // A74
    onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      // console.log(midiEvent);
      if (midiEvent.message.type === 'ControlChange') {
        console.log('Control Cangeo9kiiiiuuuuj', midiEvent.message.control);
      }
      if (midiEvent.comesFrom(K_BOARD, VMPK)) {
        console.log('Forward');
        midiOut.send(THROUGH_PORT, midiEvent.message);
      }
    }
  }
}
