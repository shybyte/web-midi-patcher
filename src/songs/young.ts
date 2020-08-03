import {MidiEvent} from '../midi-event';
import {MidiMessageRaw} from '../midi-message';
import {Patch} from '../patch';
import {MidiThroughPort, VirtualKeyboard, VMPK} from './midi-ports';

function createYoung(): Patch {
  let currentNote = 54;

  return {
    async onMidiEvent(midiMessage: MidiEvent, midiOutputs: WebMidi.MIDIOutput[]) {
      // console.log('onMidiEvent', midiMessage);
      if (midiMessage.portName === VMPK && midiMessage.message.type === 'NoteOn') {
        currentNote = midiMessage.message.note
      } else if (midiMessage.portName === VirtualKeyboard && midiMessage.message.type === 'NoteOn') {
        const output = [...midiOutputs.values()].find(it => it.name === MidiThroughPort)!;
        output.send(MidiMessageRaw.noteOn(currentNote));
        await waitMs(100)
        output.send(MidiMessageRaw.noteOff(currentNote));
      }
    }
  }
}

export const young = createYoung();

function waitMs(duration: number) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
