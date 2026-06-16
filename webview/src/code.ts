import { $, $$, setVar, calcTextWidth } from './util.js';
import { WebviewConfig } from '../../src/protocol';

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

const setupLines = (node: HTMLElement, config: WebviewConfig): void => {
    $$(':scope > br', node).forEach((row) => (row.outerHTML = '<div>&nbsp;</div>'));

    const rows = $$(':scope > div', node);
    setVar('line-number-width', calcTextWidth(rows.length + config.startLine));

    rows.forEach((row, idx) => {
        const newRow = document.createElement('div');
        newRow.classList.add('line');
        row.replaceWith(newRow);

        const lineNum = document.createElement('div');
        lineNum.classList.add('line-number');
        lineNum.classList.toggle('hidden', !config.showLineNumbers);

        lineNum.onclick = () => applyLineHighlight(newRow, lineNum);
        lineNum.textContent = String(idx + 1 + config.startLine);
        newRow.appendChild(lineNum);

        const span = document.createElement('span');
        span.textContent = ' ';
        row.appendChild(span);

        const lineCodeDiv = document.createElement('div');
        lineCodeDiv.classList.add('line-code');

        if (row.innerText.trim().length === 1 && row.childNodes.length === 2) {
            const char = row.innerText.trim();

            const lineCode = document.createElement('span');
            lineCode.innerHTML = row.innerHTML.split(char).join("");
            lineCodeDiv.appendChild(lineCode);

            const lineCode1 = document.createElement('span');
            lineCode1.innerHTML = row.innerHTML.replace(/&nbsp;/igu, "");
            lineCodeDiv.appendChild(lineCode1);
        } else {
            const lineCode = document.createElement('span');
            lineCode.innerHTML = row.innerHTML;
            lineCodeDiv.appendChild(lineCode);
        }
        newRow.appendChild(lineCodeDiv);
    });
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

export const pasteCode = (config: WebviewConfig, clipboard: DataTransfer | null): void => {
    const plainLines = getPlainLines(clipboard);
    snippetNode.innerHTML = getClipboardHtml(clipboard, plainLines);
    const code = $('div', snippetNode) || snippetNode;
    snippetNode.style.fontSize = code.style.fontSize;
    snippetNode.style.lineHeight = code.style.lineHeight;
    snippetNode.innerHTML = code.innerHTML;
    wrapLooseInlineRows(snippetNode);
    if ($$(':scope > div', snippetNode).length === 0) {
        snippetNode.innerHTML = linesToHtml(plainLines);
        snippetNode.innerHTML = ($('div', snippetNode) || snippetNode).innerHTML;
    }
    stripInitialIndent(snippetNode);
    setupLines(snippetNode, config);
};
