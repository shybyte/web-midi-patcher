import {PROGRAMM_CHANGE_INPUT_PORTS} from './config';
import {MidiEvent} from './midi-event';
import {MidiMessage} from './midi-message';
import {MidiOut} from './midi-out';
import {Patch} from './patch';
import {system} from './songs/system';
import {wahrheit} from './songs/wahrheit';
import {young} from './songs/young';
import {renderPatchSelection, renderInitialView, switchPatch} from './view';

type MIDIMessageEvent = WebMidi.MIDIMessageEvent;

console.log('Start Web Midi Patcher ...');

// Request sysex to avoid deprecation warning in chrome (https://www.chromestatus.com/feature/5138066234671104)
async function start() {
  const midiAccess = await navigator.requestMIDIAccess({sysex: true});
  console.log('Inputs:', [...midiAccess.inputs.values()]);
  console.log('Outputs:', [...midiAccess.outputs.values()]);

  const patches = [young, wahrheit, system];
  const findPatch = (name: string) => patches.find(it => it.name === name);
  const findPatchByHash = () => findPatch(location.hash.slice(1));
  let currentPatch = findPatchByHash() || patches[0];

  for (const input of midiAccess.inputs.values()) {
    input.addEventListener('midimessage', (messageEvent: MIDIMessageEvent) => {
      const midiMessage = MidiMessage.from(messageEvent);
      const midiEvent = new MidiEvent(midiMessage, messageEvent.timeStamp, input.name || '');
      // console.log(midiEvent, midiMessage);

      if (midiMessage.type === 'ProgramChange' && PROGRAMM_CHANGE_INPUT_PORTS.includes(midiEvent.portName)) {
        const newSelectedPatch = patches.find(it => it.midi_program === midiMessage.number);
        if (newSelectedPatch) {
          switchPatch(newSelectedPatch);
        } else {
          console.warn('No patch for programm ', midiMessage.number);
        }
      }

      currentPatch.onMidiEvent(midiEvent, new MidiOut(midiAccess.outputs));
    })
  }

  window.addEventListener('hashchange', () => selectPatch((findPatchByHash())!))

  function selectPatch(selectedPatch: Patch) {
    currentPatch = selectedPatch;
    renderPatchSelection(currentPatch);
  }

  renderInitialView(patches);
  renderPatchSelection(currentPatch);
}

start();
