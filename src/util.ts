import * as vscode from 'vscode';
import * as path from 'path';
import { readFile, writeFile } from 'fs/promises';

const readHtml = async (htmlPath: string, panel: vscode.WebviewPanel): Promise<string> =>
    (await readFile(htmlPath, 'utf-8'))
        .replace(/%CSP_SOURCE%/gu, panel.webview.cspSource)
        .replace(
            /(src|href)="([^"]*)"/gu,
            (_: string, type: string, src: string) =>
                `${type}="${panel.webview.asWebviewUri(
                    vscode.Uri.file(path.resolve(htmlPath, '..', src))
                )}"`
        );

const getSettings = (group: string, keys: string[]): Record<string, any> => {
    const settings = vscode.workspace.getConfiguration(group);
    const editor = vscode.window.activeTextEditor;
    const language = editor && editor.document && editor.document.languageId;
    const languageSettings =
        language && vscode.workspace.getConfiguration().get<Record<string, any>>(`[${language}]`);
    return keys.reduce((acc, k) => {
        acc[k] = languageSettings && languageSettings[`${group}.${k}`];
        if (acc[k] == null) acc[k] = settings.get(k);
        return acc;
    }, {} as Record<string, any>);
};

export { readHtml, writeFile, getSettings };
