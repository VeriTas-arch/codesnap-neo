export type ExportAction = 'save' | 'copy';

export interface WebviewConfig {
    fontLigatures?: boolean | string;
    tabSize?: string | number;
    showLineNumbers: boolean;
    startLine: number;
}
