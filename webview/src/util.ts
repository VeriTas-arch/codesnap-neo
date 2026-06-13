export const $ = <T extends Element = HTMLElement>(q: string, c: ParentNode = document): T =>
    c.querySelector(q) as T;

export const $$ = <T extends Element = HTMLElement>(q: string, c: ParentNode = document): T[] =>
    Array.from(c.querySelectorAll(q)) as T[];

export const once = (elem: Element, evt: string): Promise<Event> =>
    new Promise((done) => elem.addEventListener(evt, done, { once: true }));

export const redraw = (node: HTMLElement): number => node.clientHeight;

export const setVar = (key: string, value: string | number, node = document.body): void =>
    node.style.setProperty('--' + key, String(value));

export const calcTextWidth = (text: string | number): string => {
    const div = document.body.appendChild(document.createElement('div'));
    div.classList.add('size-test');
    div.textContent = String(text);
    const width = div.clientWidth;
    div.remove();
    return width + 1 + 'px';
};
