import { $, $$, redraw, once } from './util.js';
import type { DomToImage, VsCodeApi } from './webview.js';
import type { ExportAction } from './protocol.js';

declare const domtoimage: DomToImage;
declare function acquireVsCodeApi(): VsCodeApi;

const vscode = acquireVsCodeApi();
const windowNode = $('#window');

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

export const takeSnap = async (exportAction: ExportAction): Promise<void> => {
    try {
        const url = await domtoimage.toPng(windowNode, {
            bgColor: 'transparent',
            scale: SNAP_SCALE,
            postProcess: (node: HTMLElement) => {
                $$('#snippet-container, #snippet, .line, .line-code span', node).forEach(
                    (span) => (span.style.width = 'unset')
                );
                $$('.line-code', node).forEach((span) => (span.style.width = 'max-content'));
            }
        });

        const data = url.slice(url.indexOf(',') + 1);
        if (exportAction === 'copy') {
            const binary = atob(data);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
            const blob = new Blob([array], { type: 'image/png' });
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            cameraFlashAnimation();
        } else {
            vscode.postMessage({ type: 'save', data });
        }
    } catch (error) {
        reportError(error instanceof Error ? error.message : 'Failed to take screenshot.');
    }
};
