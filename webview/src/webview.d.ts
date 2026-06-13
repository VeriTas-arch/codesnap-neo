interface VsCodeApi {
    postMessage(message: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

declare const domtoimage: {
    toPng(
        node: HTMLElement,
        options: {
            bgColor: string;
            scale: number;
            postProcess(node: HTMLElement): void;
        }
    ): Promise<string>;
};
