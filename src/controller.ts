import * as _ from 'lodash';
import {Effect} from './effect'
import render from './components/app-view';
import {AppViewState} from './app-view-state';

import {Patch} from './patch';
import pollyPatch from './patches/polly';
import amazonPatch from './patches/amazon';

import MIDIAccess = WebMidi.MIDIAccess;
import MIDIInput = WebMidi.MIDIInput;
import MIDIOutput = WebMidi.MIDIOutput;


export function startController(midiAccess: MIDIAccess) {

  // const INPUT_MIDI_NAME = 'SamplePad';
  // const INPUT_MIDI_NAME = 'USB MIDI';
  const OUTPUT_MIDI_NAME = 'USB MIDI';

  let output: MIDIOutput;

  var patches = [pollyPatch, amazonPatch];
  let viewState: AppViewState = {
    patches: patches,
    currentPatch: _.find(patches, {name: localStorage.getItem('currentPatch') || 'Polly'}),
    controller: {
      setPatch(patch: Patch){
        viewState.currentPatch = patch;
        localStorage.setItem('currentPatch', patch.name);
        renderApp();
      }
    }
  };

  let activeEffects: Effect[] = [];

  function init() {
    console.log('MIDI Access Object', midiAccess);
    midiAccess.inputs.forEach(input => {
      console.log("Input port [type:'" + input.type + "'] id:'" + input.id +
        "' manufacturer:'" + input.manufacture + "' name:'" + input.name +
        "' version:'" + input.version + "'");
    });
    midiAccess.outputs.forEach(output1 => {
      console.log("Output port [type:'" + output1.type + "'] id:'" + output1.id +
        "' manufacturer:'" + output1.manufacture + "' name:'" + output1.name +
        "' version:'" + output1.version + "'");
      if (_.includes(output1.name, OUTPUT_MIDI_NAME)) {
        output = output1 as WebMidi.MIDIOutput;
      }
    });
    startMainLoop();
  }


  function startMainLoop() {
    midiAccess.inputs.forEach(function (entry) {
      entry.onmidimessage = (event) => {
        const dataString = event.data.join(' ');
        const hexDataString = _.map(event.data, (x: number) => '0x' + x.toString(16)).join(' ');
        // console.log("MIDI message received at timestamp " + event.receivedTime + "[" + event.data.length + " bytes]: " + hexDataString + '/' + dataString);
        console.log("MIDI message received " + hexDataString + '/' + dataString);

        if (_.includes(entry.name, 'USB MIDI') && event.data[0] == 192) {
          const newPatch = _.find(patches, {instrumentNumber: event.data[1]});
          if (newPatch) {
            viewState.controller.setPatch(newPatch);
          }
        }

        if (!_.includes(entry.name, viewState.currentPatch.inputMidiName)) {
          return;
        }
        if ((event.data[0] & 0xf0) === 0x90 && event.data[2] > 0) {
          const effect = viewState.currentPatch.effectByNote[event.data[1]];
          if (effect) {
            activeEffects = [...activeEffects.filter(activeEffect =>
              _.intersection(activeEffect.monoGroups, effect.monoGroups).length === 0
            ), effect];
            effect.trigger(event.data[2], window.performance.now());
          } else {
            console.log('No effect!', event.data[1]);
          }
        }
      };
    });

    setInterval(() => {
      activeEffects.forEach(effect => {
        effect.play(output, window.performance.now());
      });
      activeEffects = activeEffects.filter(effect => !effect.hasFinished());
    }, 10);
  }

  function renderApp() {
    render(viewState);
  }

  init();
  renderApp();
}