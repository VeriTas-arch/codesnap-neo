import { $, $$, redraw, once, setVar } from './util.js';
import { WebviewConfig } from '../../src/protocol';

const vscode = acquireVsCodeApi();
const windowNode = $('#window');
const snippetContainerNode = $('#snippet-container');

const flashFx = $('#flash-fx');

const SNAP_SCALE = 2;

const reportError = (message: string): void => {
    vscode.postMessage({ type: 'error', message });
};

export const cameraFlashAnimation = async (): Promise<void> => {
    flashFx.style.display = 'block';
    redraw(flashFx);
    flashFx.style.opacity = '0';
    await once(flashFx, 'transitionend');
    flashFx.style.display = 'none';
    flashFx.style.opacity = '1';
};

export const takeSnap = async (config: WebviewConfig): Promise<void> => {
    windowNode.style.resize = 'none';

    try {
        if (config.transparentBackground || config.target === 'window') {
            setVar('container-background-color', 'transparent');
        }

        const target = config.target === 'container' ? snippetContainerNode : windowNode;

        const url = await domtoimage.toPng(target, {
            bgColor: 'transparent',
            scale: SNAP_SCALE,
            postProcess: (node: HTMLElement) => {
                $$('#snippet-container, #snippet, .line, .line-code span', node).forEach(
                    (span) => (span.style.width = 'unset')
                );
                $$('.line-code', node).forEach((span) => (span.style.width = '100%'));
            }
        });

        const data = url.slice(url.indexOf(',') + 1);
        if (config.shutterAction === 'copy') {
            const binary = atob(data);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
            const blob = new Blob([array], { type: 'image/png' });
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            cameraFlashAnimation();
        } else {
            vscode.postMessage({ type: config.shutterAction, data });
        }
    } catch (error) {
        reportError(error instanceof Error ? error.message : 'Failed to take screenshot.');
    } finally {
        windowNode.style.resize = 'horizontal';
        setVar('container-background-color', config.backgroundColor);
    }
};
