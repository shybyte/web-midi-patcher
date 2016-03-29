import {startController} from './controller';

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(startController, onMIDIFailure);
} else {
  alert("No MIDI support in your browser.");
}

function onMIDIFailure(e: Error) {
  alert("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}