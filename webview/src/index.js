import { $, $$, setVar } from './util.js';
import { pasteCode } from './code.js';
import { takeSnap, cameraFlashAnimation } from './snap.js';

const navbarNode = $('#navbar');
const windowControlsNode = $('#window-controls');
const windowTitleNode = $('#window-title');
const btnSave = $('#save');
const btnCopy = $('#secondMainBtn');

const showLineNumBtn = $('#showLineNumBtn');
const showWindowControlsBtn = $('#showWindowControlsBtn');
const modeChangeBtn = $('#modeChangeBtn');
const rightPanelNode = $('#rightPanel');

let toolMode;
let showLineNumbersState = true;
let showWindowControlsState = true;
let showWindowTitleState = false;
let config = null;

document.addEventListener('copy', () => {
    if (config) takeSnap({ ...config, shutterAction: 'copy' });
});

document.addEventListener('paste', (e) => {
    if (config) pasteCode(config, e.clipboardData);
});

const setButtonChecked = (button, checked) => {
    button.querySelector('svg').classList.toggle('opacity-0', !checked);
};

const updateNavbarVisibility = () => {
    windowControlsNode.hidden = !showWindowControlsState;
    navbarNode.hidden = !showWindowControlsState && !showWindowTitleState;
};

const toolModeToggled = () => {
    if (toolMode === 'advanced') {
        btnCopy.classList.remove('hidden');
        showLineNumBtn.classList.remove('hidden');
        showWindowControlsBtn.classList.remove('hidden');
        rightPanelNode.classList.remove('justify-end');
        modeChangeBtn.textContent = 'Simple Mode';
    } else {
        btnCopy.classList.add('hidden');
        showLineNumBtn.classList.add('hidden');
        showWindowControlsBtn.classList.add('hidden');
        rightPanelNode.classList.add('justify-end');
        modeChangeBtn.textContent = 'Advanced Mode';
    }
};

btnSave.addEventListener('click', () => {
    if (config) takeSnap(config);
});

btnCopy.addEventListener('click', () => {
    if (!config) return;
    const shutterAction = config.shutterAction === 'save' ? 'copy' : 'save';
    takeSnap({ ...config, shutterAction });
});

showLineNumBtn.addEventListener('click', () => {
    showLineNumbersState = !showLineNumbersState;
    setButtonChecked(showLineNumBtn, showLineNumbersState);

    $$('.line-number').forEach(lineNum => {
        lineNum.classList.toggle('hidden', !showLineNumbersState);
    });
});

showWindowControlsBtn.addEventListener('click', () => {
    showWindowControlsState = !showWindowControlsState;
    setButtonChecked(showWindowControlsBtn, showWindowControlsState);
    updateNavbarVisibility();
});

modeChangeBtn.addEventListener('click', () => {
    toolMode = toolMode === 'advanced' ? 'simple' : 'advanced';
    toolModeToggled();
});

window.addEventListener('message', ({ data: { type, ...cfg } }) => {
    if (type === 'update') {
        config = cfg;

        const {
            fontLigatures,
            tabSize,
            backgroundColor,
            boxShadow,
            containerPadding,
            roundedCorners,
            showWindowControls,
            showWindowTitle,
            windowTitle,
            shutterAction,
            showLineNumbers,
            toolMode: nextToolMode
        } = config;

        showLineNumbersState = showLineNumbers;
        showWindowControlsState = showWindowControls;
        showWindowTitleState = showWindowTitle;
        toolMode = nextToolMode;

        setVar('ligatures', fontLigatures ? 'normal' : 'none');
        if (typeof fontLigatures === 'string') setVar('font-features', fontLigatures);
        setVar('tab-size', tabSize);
        setVar('container-background-color', backgroundColor);
        setVar('box-shadow', boxShadow);
        setVar('container-padding', containerPadding);
        setVar('window-border-radius', roundedCorners ? '4px' : 0);

        updateNavbarVisibility();
        windowTitleNode.hidden = !showWindowTitle;

        windowTitleNode.textContent = windowTitle;

        document.execCommand('paste');

        if (shutterAction === 'save') {
            btnCopy.textContent = 'Copy';
        } else {
            btnCopy.textContent = 'Save As...';
        }

        setButtonChecked(showLineNumBtn, showLineNumbersState);
        setButtonChecked(showWindowControlsBtn, showWindowControlsState);
        toolModeToggled();

    } else if (type === 'flash') {
        cameraFlashAnimation();
    }
});
