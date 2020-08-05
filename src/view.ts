import {Patch} from './patch';

type PatchSelectionHandler = (selectedPatch: Patch) => void;

export function renderView(patches: Patch[]) {
  // Render initial view
  const appHtml =
    '<ul>' + (patches.map((patch, i) => (
        `<li class="patch" data-index="${i}"><a href="#${patch.name}">${patch.name}</a></li>`
      )).join('')
    ) + '</ul>'
  const appElement = document.getElementById('app')!;
  appElement.innerHTML = appHtml;

  document.addEventListener('keydown', (keyEvent) => {
    const patchEl = document.querySelector('.patch[aria-selected="true"]');
    const selectedPatchIndex = parseInt(patchEl!.getAttribute('data-index')!);
    if (keyEvent.key === 'ArrowUp') {
      location.hash = patches[(selectedPatchIndex + patches.length - 1) % patches.length].name;
    } else if (keyEvent.key === 'ArrowDown') {
      location.hash = patches[(selectedPatchIndex + 1) % patches.length].name;
    }
  });
}

export function renderPatchSelection(selectedPatch: Patch) {
  const patchListItems = document.getElementsByClassName('patch');
  for (const patchEl of patchListItems) {
    patchEl.setAttribute('aria-selected',
      patchEl.textContent === selectedPatch.name ? 'true' : 'false');
  }
}
