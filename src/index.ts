import {PROGRAMM_CHANGE_INPUT_PORTS} from './config';
import {MidiEvent} from './midi-event';
import {MidiMessage} from './midi-message';
import {MidiOut} from './midi-out';
import {HAND_SONIC, THROUGH_PORT} from './midi-ports';
import {Patch} from './patch';
import {diktator} from './songs/diktator';
import {endzeit} from './songs/endzeit';
import {jam} from './songs/jam';
import {liebtUns} from './songs/liebt-uns';
import {pedalBaseNote} from './songs/pedal-base-note';
import {sequenceDrums} from './songs/sequence-drums';
import {system} from './songs/system';
import {test} from './songs/test';
import {wahrheit} from './songs/wahrheit';
import {young} from './songs/young';
import {connectControls, renderInitialView, renderPatchSelection, switchPatchPage, View} from './view';

type MIDIMessageEvent = WebMidi.MIDIMessageEvent;

console.log('Start Web Midi Patcher ...');

// Request sysex to avoid deprecation warning in chrome (https://www.chromestatus.com/feature/5138066234671104)
async function start() {
  const midiAccess = await navigator.requestMIDIAccess({sysex: true});
  console.log('Inputs:', [...midiAccess.inputs.values()].map(it => it.name));
  console.log('Outputs:', [...midiAccess.outputs.values()].map(it => it.name));
  const midiOut = new MidiOut(midiAccess.outputs);

  let view: View;

  function setStatusDisplayHtml(html: string) {
    view.setCurrentPatchDisplay(html);
  }

  const patchFactories = [sequenceDrums, pedalBaseNote, jam, test, young, wahrheit, system, diktator, liebtUns, endzeit];
  // const patchFactories = [jam];
  let patches = patchFactories.map((it) => it({setStatusDisplayHtml}));
  let currentPatch: Patch = patches[0];

  function selectPatchFromPageHash() {
    patches = patchFactories.map((it) => it({setStatusDisplayHtml}));
    const hash = decodeURIComponent(location.hash.slice(1));
    currentPatch = patches.find(it => it.name === hash) || currentPatch;
    view.setCurrentPatchDisplay('');
    midiOut.programChange(HAND_SONIC, currentPatch.drumProgram ?? 107);
    renderPatchSelection(currentPatch);
  }

  for (const input of midiAccess.inputs.values()) {
    input.addEventListener('midimessage', (messageEvent: MIDIMessageEvent) => {
      const midiMessage = MidiMessage.from(messageEvent);
      const midiEvent = new MidiEvent(midiMessage, messageEvent.timeStamp, input.name || '');

      if (midiMessage.type === 'Unknown' || midiEvent.comesFrom(THROUGH_PORT)) {
        return; // Ignore e.g. clock events
      }

      // console.log(midiEvent, midiMessage);

      if (midiMessage.type === 'ProgramChange' && midiEvent.comesFrom(...PROGRAMM_CHANGE_INPUT_PORTS)) {
        const newSelectedPatch = patches.find(it => it.midiProgram === midiMessage.number);
        if (newSelectedPatch) {
          switchPatchPage(newSelectedPatch);
        } else {
          console.warn('No patch for programm ', midiMessage.number);
        }
      }

      currentPatch.onMidiEvent(midiEvent, midiOut);
    })
  }

  view = renderInitialView(patches, () => {
    midiOut.allSoundsOff();
  });

  window.addEventListener('hashchange', selectPatchFromPageHash);
  selectPatchFromPageHash();

  connectControls(midiOut);
}

start();
