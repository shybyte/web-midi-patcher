import {MidiMessage} from './midi-message';
import {young} from './songs/young';

type MIDIMessageEvent = WebMidi.MIDIMessageEvent;

console.log('Start Web Midi Patcher ...');

// Request sysex to avoid deprecation warning in chrome (https://www.chromestatus.com/feature/5138066234671104)
async function start() {
  const midiAccess = await navigator.requestMIDIAccess({sysex: true});
  console.log([...midiAccess.inputs.values()]);

  const currentPatch = young;

  function onMidiMessage(messageEvent: MIDIMessageEvent) {
    currentPatch.onMidiEvent(MidiMessage.from(messageEvent), [...midiAccess.outputs.values()])
  }

  for (const input of midiAccess.inputs.values()) {
    input.addEventListener('midimessage', onMidiMessage)
  }
}

start();
