import { $, $$, setVar } from './util.js';
import { pasteCode } from './code.js';
import { takeSnap, cameraFlashAnimation } from './snap.js';
import type { WebviewConfig } from './protocol.js';

const navbarNode = $('#navbar');
const windowControlsNode = $('#window-controls');
const windowTitleNode = $('#window-title');
const btnSave = $('#save');
const btnCopy = $('#secondMainBtn');

const showLineNumBtn = $('#showLineNumBtn');
const showWindowControlsBtn = $('#showWindowControlsBtn');
const modeChangeBtn = $('#modeChangeBtn');
const rightPanelNode = $('#rightPanel');

const state = {
    config: null as WebviewConfig | null,
    toolMode: 'advanced',
    showLineNumbers: true,
    showWindowControls: true,
    showWindowTitle: false
};

document.addEventListener('copy', () => {
    requestSnap('copy');
});

document.addEventListener('paste', (e) => {
    if (state.config) pasteCode(state.config, e.clipboardData);
});

const setButtonChecked = (button: HTMLElement, checked: boolean): void => {
    const icon = button.querySelector('svg');
    if (icon) icon.classList.toggle('opacity-0', !checked);
};

const updateNavbarVisibility = (): void => {
    windowControlsNode.hidden = !state.showWindowControls;
    navbarNode.hidden = !state.showWindowControls && !state.showWindowTitle;
};

const toolModeToggled = (): void => {
    if (state.toolMode === 'advanced') {
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

const updateSecondaryAction = (): void => {
    btnCopy.textContent = state.config && state.config.shutterAction === 'save' ? 'Copy' : 'Save As...';
};

const requestSnap = (shutterAction: WebviewConfig['shutterAction'] | null): void => {
    if (!shutterAction) return;
    if (!state.config) return;
    takeSnap({ ...state.config, shutterAction });
};

const applyConfig = (nextConfig: WebviewConfig): void => {
    state.config = nextConfig;
    state.showLineNumbers = nextConfig.showLineNumbers;
    state.showWindowControls = nextConfig.showWindowControls;
    state.showWindowTitle = nextConfig.showWindowTitle;
    state.toolMode = nextConfig.toolMode;

    setVar('ligatures', nextConfig.fontLigatures ? 'normal' : 'none');
    if (typeof nextConfig.fontLigatures === 'string') setVar('font-features', nextConfig.fontLigatures);
    setVar('tab-size', nextConfig.tabSize || 4);
    setVar('container-background-color', nextConfig.backgroundColor);
    setVar('box-shadow', nextConfig.boxShadow);
    setVar('container-padding', nextConfig.containerPadding);
    setVar('window-border-radius', nextConfig.roundedCorners ? '4px' : 0);

    updateNavbarVisibility();
    windowTitleNode.hidden = !state.showWindowTitle;
    windowTitleNode.textContent = nextConfig.windowTitle;
    updateSecondaryAction();
    setButtonChecked(showLineNumBtn, state.showLineNumbers);
    setButtonChecked(showWindowControlsBtn, state.showWindowControls);
    toolModeToggled();
};

btnSave.addEventListener('click', () => requestSnap(state.config && state.config.shutterAction));

btnCopy.addEventListener('click', () => {
    if (!state.config) return;
    requestSnap(state.config.shutterAction === 'save' ? 'copy' : 'save');
});

showLineNumBtn.addEventListener('click', () => {
    state.showLineNumbers = !state.showLineNumbers;
    setButtonChecked(showLineNumBtn, state.showLineNumbers);

    $$('.line-number').forEach(lineNum => {
        lineNum.classList.toggle('hidden', !state.showLineNumbers);
    });
});

showWindowControlsBtn.addEventListener('click', () => {
    state.showWindowControls = !state.showWindowControls;
    setButtonChecked(showWindowControlsBtn, state.showWindowControls);
    updateNavbarVisibility();
});

modeChangeBtn.addEventListener('click', () => {
    state.toolMode = state.toolMode === 'advanced' ? 'simple' : 'advanced';
    toolModeToggled();
});

window.addEventListener('message', ({ data: { type, ...cfg } }) => {
    if (type === 'update') {
        applyConfig(cfg);
        document.execCommand('paste');

    } else if (type === 'flash') {
        cameraFlashAnimation();
    }
});
