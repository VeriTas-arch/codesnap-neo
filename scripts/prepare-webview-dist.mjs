import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fromRoot = (...segments) => resolve(root, ...segments);

const distDir = fromRoot('webview', 'dist');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

copyFileSync(
    fromRoot('webview', 'vendor', 'dom-to-image-more.min.js'),
    fromRoot('webview', 'dist', 'dom-to-image-more.min.js')
);
copyFileSync(
    fromRoot('webview', 'vendor', 'dom-to-image-even-more.LICENSE.txt'),
    fromRoot('webview', 'dist', 'dom-to-image-even-more.LICENSE.txt')
);
