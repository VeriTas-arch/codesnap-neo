export interface VsCodeApi {
    postMessage(message: unknown): void;
}

export interface DomToImage {
    toPng(
        node: HTMLElement,
        options: {
            bgColor: string;
            scale: number;
            postProcess(node: HTMLElement): void;
        }
    ): Promise<string>;
}
