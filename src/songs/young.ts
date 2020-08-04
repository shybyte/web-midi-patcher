import {HarmonyDrum} from '../effects/harmony-drum';
import {CUTOFF} from '../microkorg';
import {MidiEvent} from '../midi-event';
import {filterBy, filterByPort} from '../midi-filter';
import {MidiMessageRaw} from '../midi-message';
import {MidiOut} from '../midi-out';
import {Patch} from '../patch';
import {mapRange} from '../utils';
import {MidiThroughPort, VirtualKeyboard, VMPK} from './midi-ports';

function createYoung(): Patch {
  const commonHarmonyDrum = {
    baseNoteInputFilter: filterByPort(VMPK),
    resetDuration: 10_0000,
    outputPortName: MidiThroughPort,
  };

  const effects = [
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(VirtualKeyboard, 71),
      noteOffsets: [0]
    }),
    new HarmonyDrum({
      ...commonHarmonyDrum,
      trigger: filterBy(VirtualKeyboard, 72),
      noteOffsets: [7, 12, 19]
    })
  ];

  return {
    name: 'Young',
    async onMidiEvent(midiEvent: MidiEvent, midiOut: MidiOut) {
      // console.log('onMidiEvent', midiEvent, midiEvent.message);
      for (const effect of effects) {
        effect.onMidiEvent(midiEvent, midiOut).then(r => {/*Ignore*/
        });
      }
      if (midiEvent.portName === VMPK && midiEvent.message.type === 'ControlChange') {
        midiOut.send(MidiThroughPort, MidiMessageRaw.pitchBendChange(midiEvent.message.value))
        const cutoffValue = mapRange([0, 127], [10, 127], midiEvent.message.value);
        midiOut.send(MidiThroughPort, MidiMessageRaw.controlChange(CUTOFF, cutoffValue))
      }
    }
  }
}

export const young = createYoung();
