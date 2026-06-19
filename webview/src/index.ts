import { $, $$, setVar } from './util.js';
import { pasteCode, setHighlightMode } from './code.js';
import type { HighlightMode } from './code.js';
import { takeSnap, cameraFlashAnimation } from './snap.js';
import type { ExportAction, WebviewConfig } from './protocol.js';

const btnSave = $('#btnSave');
const btnCopy = $('#btnCopy');

const showLineNumBtn = $('#showLineNumBtn');
const highlightButtons: Array<{ button: HTMLElement; mode: HighlightMode }> = [
    { button: $('#highlightFocusBtn'), mode: 'line-focus' },
    { button: $('#highlightAddBtn'), mode: 'git-add' },
    { button: $('#highlightRemoveBtn'), mode: 'git-remove' },
    { button: $('#highlightClearBtn'), mode: null }
];

const state = {
    config: null as WebviewConfig | null,
    showLineNumbers: true
};

document.addEventListener('copy', () => {
    requestExport('copy');
});

document.addEventListener('paste', (e) => {
    if (state.config) pasteCode(state.config, e.clipboardData);
});

const setButtonPressed = (button: HTMLElement, pressed: boolean): void => {
    button.setAttribute('aria-pressed', String(pressed));
    button.classList.toggle('is-active', pressed);
};

const selectHighlightMode = (mode: HighlightMode): void => {
    setHighlightMode(mode);
    highlightButtons.forEach(({ button, mode: buttonMode }) => {
        setButtonPressed(button, buttonMode === mode);
    });
};

const requestExport = (exportAction: ExportAction): void => {
    if (!state.config) return;
    takeSnap(exportAction);
};

const applyConfig = (nextConfig: WebviewConfig): void => {
    state.config = nextConfig;
    state.showLineNumbers = nextConfig.showLineNumbers;

    setVar('ligatures', nextConfig.fontLigatures ? 'normal' : 'none');
    if (typeof nextConfig.fontLigatures === 'string') setVar('font-features', nextConfig.fontLigatures);
    setVar('tab-size', nextConfig.tabSize || 4);
    setButtonPressed(showLineNumBtn, state.showLineNumbers);
};

btnSave.addEventListener('click', () => requestExport('save'));
btnCopy.addEventListener('click', () => requestExport('copy'));

showLineNumBtn.addEventListener('click', () => {
    state.showLineNumbers = !state.showLineNumbers;
    setButtonPressed(showLineNumBtn, state.showLineNumbers);

    $$('.line-number').forEach(lineNum => {
        lineNum.classList.toggle('hidden', !state.showLineNumbers);
    });
});

highlightButtons.forEach(({ button, mode }) => {
    button.addEventListener('click', () => selectHighlightMode(mode));
});

window.addEventListener('message', ({ data: { type, ...cfg } }) => {
    if (type === 'update') {
        applyConfig(cfg);
        document.execCommand('paste');

    } else if (type === 'flash') {
        cameraFlashAnimation();
    }
});
