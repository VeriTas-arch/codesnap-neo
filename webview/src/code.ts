import { $, $$, setVar, calcTextWidth } from './util.js';
import type { WebviewConfig } from './protocol.js';

const snippetNode = $('#snippet');
const HIGHLIGHT_CLASSES = ['line-focus', 'git-add', 'git-remove'];

const getNextHighlightClass = (lineNode: HTMLElement): string | null => {
    if (lineNode.classList.contains('line-focus')) return 'git-add';
    if (lineNode.classList.contains('git-add')) return 'git-remove';
    if (lineNode.classList.contains('git-remove')) return null;
    return 'line-focus';
};

const applyLineHighlight = (lineNode: HTMLElement, lineNumNode: HTMLElement): void => {
    const nextClass = getNextHighlightClass(lineNode);

    HIGHLIGHT_CLASSES.forEach(className => lineNode.classList.remove(className));
    if (nextClass) lineNode.classList.add(nextClass);
    lineNumNode.classList.toggle('!text-white', Boolean(nextClass));
};

const createLineNumber = (
    lineNode: HTMLElement,
    lineNumber: number,
    showLineNumbers: boolean
): HTMLDivElement => {
    const lineNum = document.createElement('div');
    lineNum.classList.add('line-number');
    lineNum.classList.toggle('hidden', !showLineNumbers);
    lineNum.onclick = () => applyLineHighlight(lineNode, lineNum);
    lineNum.textContent = String(lineNumber);
    return lineNum;
};

const appendLineCode = (lineCodeDiv: HTMLDivElement, row: HTMLElement): void => {
    const spacer = document.createElement('span');
    spacer.textContent = ' ';
    row.appendChild(spacer);

    if (row.innerText.trim().length === 1 && row.childNodes.length === 2) {
        const char = row.innerText.trim();

        const lineCode = document.createElement('span');
        lineCode.innerHTML = row.innerHTML.split(char).join('');
        lineCodeDiv.appendChild(lineCode);

        const lineCode1 = document.createElement('span');
        lineCode1.innerHTML = row.innerHTML.replace(/&nbsp;/igu, '');
        lineCodeDiv.appendChild(lineCode1);
        return;
    }

    const lineCode = document.createElement('span');
    lineCode.innerHTML = row.innerHTML;
    lineCodeDiv.appendChild(lineCode);
};

const renderLine = (row: HTMLElement, lineNumber: number, config: WebviewConfig): void => {
    const lineNode = document.createElement('div');
    lineNode.classList.add('line');
    row.replaceWith(lineNode);

    lineNode.appendChild(createLineNumber(lineNode, lineNumber, config.showLineNumbers));

    const lineCodeDiv = document.createElement('div');
    lineCodeDiv.classList.add('line-code');
    appendLineCode(lineCodeDiv, row);
    lineNode.appendChild(lineCodeDiv);
};

const renderRows = (node: HTMLElement, config: WebviewConfig): void => {
    $$(':scope > br', node).forEach((row) => (row.outerHTML = '<div>&nbsp;</div>'));

    const rows = $$(':scope > div', node);
    setVar('line-number-width', calcTextWidth(rows.length + config.startLine));

    rows.forEach((row, idx) => renderLine(row, idx + 1 + config.startLine, config));
};

const stripInitialIndent = (node: HTMLElement): void => {
    const regIndent = /^\s+/u;
    const initialSpans = $$(':scope > div > span:first-child', node);
    if (initialSpans.length === 0) return;
    if (initialSpans.some((span) => !regIndent.test(span.textContent || ''))) return;
    const minIndent = Math.min(
        ...initialSpans.map((span) => {
            const match = span.textContent ? span.textContent.match(regIndent) : null;
            return match ? match[0].length : 0;
        })
    );
    initialSpans.forEach((span) => {
        span.textContent = span.textContent ? span.textContent.slice(minIndent) : '';
    });
};

const escapeHtml = (text: string): string =>
    text
        .replace(/&/gu, '&amp;')
        .replace(/</gu, '&lt;')
        .replace(/>/gu, '&gt;');

const getPlainLines = (clip: DataTransfer | null): string[] => {
    if (!clip) return [''];
    const text = clip.getData('text/plain').replace(/\r\n?/gu, '\n');
    return text.split('\n');
};

const linesToHtml = (lines: string[]): string =>
    `<div>${lines
        .map((line) => `<div>${escapeHtml(line)}</div>`)
        .join('')}</div>`;

const wrapLooseInlineRows = (node: HTMLElement): void => {
    if ($$(':scope > div', node).length > 0 || $$(':scope > br', node).length === 0) return;

    const rows: HTMLDivElement[] = [];
    let row = document.createElement('div');

    Array.from(node.childNodes).forEach((child) => {
        if (child instanceof HTMLBRElement) {
            rows.push(row);
            row = document.createElement('div');
            return;
        }

        row.appendChild(child);
    });
    rows.push(row);
    node.replaceChildren(...rows);
};

const getClipboardHtml = (clip: DataTransfer | null, plainLines: string[]): string => {
    if (!clip) return linesToHtml(plainLines);

    const html = clip.getData('text/html');
    if (html) return html;
    return linesToHtml(plainLines);
};

const usePlainTextFallback = (node: HTMLElement, plainLines: string[]): void => {
    node.innerHTML = linesToHtml(plainLines);
    node.innerHTML = ($('div', node) || node).innerHTML;
};

const normalizeClipboardHtml = (node: HTMLElement, html: string, plainLines: string[]): void => {
    node.innerHTML = html;
    const code = $('div', node) || node;
    node.style.fontSize = code.style.fontSize;
    node.style.lineHeight = code.style.lineHeight;
    node.innerHTML = code.innerHTML;
    wrapLooseInlineRows(node);
    if ($$(':scope > div', node).length === 0) {
        usePlainTextFallback(node, plainLines);
    }
};

export const pasteCode = (config: WebviewConfig, clipboard: DataTransfer | null): void => {
    const plainLines = getPlainLines(clipboard);
    normalizeClipboardHtml(snippetNode, getClipboardHtml(clipboard, plainLines), plainLines);
    stripInitialIndent(snippetNode);
    renderRows(snippetNode, config);
};
