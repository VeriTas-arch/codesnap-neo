import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';
import { readHtml, writeFile, getSettings } from './util';
import { ExtensionToWebviewMessage, WebviewConfig, WebviewToExtensionMessage } from './protocol';

const getConfig = (): WebviewConfig => {
    const editorSettings = getSettings('editor', ['fontLigatures', 'tabSize']);
    const editor = vscode.window.activeTextEditor;
    if (editor) editorSettings.tabSize = editor.options.tabSize;

    const extensionSettings = getSettings('codesnap-neo', [
        'backgroundColor',
        'boxShadow',
        'containerPadding',
        'roundedCorners',
        'showWindowControls',
        'showWindowTitle',
        'showLineNumbers',
        'realLineNumbers',
        'transparentBackground',
        'target',
        'shutterAction',
        'toolMode'
    ]);

    const selection = editor && editor.selection;
    const startLine = extensionSettings.realLineNumbers ? (selection ? selection.start.line : 0) : 0;

    let windowTitle = '';
    if (editor && extensionSettings.showWindowTitle) {
        const activeFileName = editor.document.uri.path.split('/').pop();
        windowTitle = `${vscode.workspace.name} - ${activeFileName}`;
    }

    return {
        ...editorSettings,
        ...extensionSettings,
        startLine,
        windowTitle
    } as WebviewConfig;
};

const createPanel = async (context: vscode.ExtensionContext): Promise<vscode.WebviewPanel> => {
    const panel = vscode.window.createWebviewPanel(
        'codesnap',
        'CodeSnap Neo 📸',
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        }
    );
    panel.webview.html = await readHtml(
        path.resolve(context.extensionPath, 'webview/index.html'),
        panel
    );

    return panel;
};

let lastUsedImageUri = vscode.Uri.file(path.resolve(homedir(), 'Desktop/code.png'));
const saveImage = async (data: string): Promise<void> => {
    const uri = await vscode.window.showSaveDialog({
        filters: { Images: ['png'] },
        defaultUri: lastUsedImageUri
    });
    if (!uri) return;

    lastUsedImageUri = uri;
    await writeFile(uri.fsPath, Buffer.from(data, 'base64'));
};

const hasOneSelection = (selections: readonly vscode.Selection[]): boolean =>
    selections && selections.length === 1 && !selections[0].isEmpty;

const isWebviewMessage = (message: unknown): message is WebviewToExtensionMessage => {
    if (!message || typeof message !== 'object') return false;

    const { type } = message as { type?: unknown };
    return type === 'save' || type === 'error';
};

const runCommand = async (context: vscode.ExtensionContext): Promise<void> => {
    const panel = await createPanel(context);

    const update = async () => {
        await vscode.commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');
        const message: ExtensionToWebviewMessage = { type: 'update', ...getConfig() };
        panel.webview.postMessage(message);
    };

    const flash = () => {
        const message: ExtensionToWebviewMessage = { type: 'flash' };
        panel.webview.postMessage(message);
    };

    panel.webview.onDidReceiveMessage(async (message: unknown) => {
        if (!isWebviewMessage(message)) {
            vscode.window.showErrorMessage('CodeSnap: Received an unknown webview message.');
            return;
        }

        if (message.type === 'save') {
            flash();
            await saveImage(message.data);
        } else if (message.type === 'error') {
            vscode.window.showErrorMessage(`CodeSnap: ${message.message}`);
        } else {
            vscode.window.showErrorMessage(`CodeSnap: Unknown webview message "${message.type}"`);
        }
    });

    const selectionHandler = vscode.window.onDidChangeTextEditorSelection(
        (e) => hasOneSelection(e.selections) && update()
    );
    panel.onDidDispose(() => selectionHandler.dispose());

    const editor = vscode.window.activeTextEditor;
    if (editor && hasOneSelection(editor.selections)) update();
};

export const activate = (context: vscode.ExtensionContext): void => {
    context.subscriptions.push(
        vscode.commands.registerCommand('codesnap-neo.start', () => runCommand(context))
    );
};
