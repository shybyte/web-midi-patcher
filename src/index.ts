import {MidiEvent} from './midi-event';
import {MidiMessage} from './midi-message';
import {young} from './songs/young';

type MIDIMessageEvent = WebMidi.MIDIMessageEvent;

console.log('Start Web Midi Patcher ...');

// Request sysex to avoid deprecation warning in chrome (https://www.chromestatus.com/feature/5138066234671104)
async function start() {
  const midiAccess = await navigator.requestMIDIAccess({sysex: true});
  console.log('Inputs:', [...midiAccess.inputs.values()]);
  console.log('Outputs:', [...midiAccess.outputs.values()]);

  const currentPatch = young;

  for (const input of midiAccess.inputs.values()) {
    input.addEventListener('midimessage', (messageEvent: MIDIMessageEvent) => {
      const midiMessage = MidiMessage.from(messageEvent);
      currentPatch.onMidiEvent(new MidiEvent(midiMessage, messageEvent.timeStamp, input.name || ''),
        [...midiAccess.outputs.values()])
    })
  }
}

start();
