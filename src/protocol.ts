type ShutterAction = 'save' | 'copy';
type SnapshotTarget = 'container' | 'window';
type ToolMode = 'simple' | 'advanced';

interface WebviewConfig {
    fontLigatures?: boolean | string;
    tabSize?: string | number;
    backgroundColor: string;
    boxShadow: string;
    containerPadding: string;
    roundedCorners: boolean;
    showWindowControls: boolean;
    showWindowTitle: boolean;
    showLineNumbers: boolean;
    realLineNumbers: boolean;
    transparentBackground: boolean;
    target: SnapshotTarget;
    shutterAction: ShutterAction;
    toolMode: ToolMode;
    startLine: number;
    windowTitle: string;
}

interface UpdateMessage extends WebviewConfig {
    type: 'update';
}

interface FlashMessage {
    type: 'flash';
}

interface SaveMessage {
    type: 'save';
    data: string;
}

interface ErrorMessage {
    type: 'error';
    message: string;
}

type ExtensionToWebviewMessage = UpdateMessage | FlashMessage;
type WebviewToExtensionMessage = SaveMessage | ErrorMessage;

export type {
    ExtensionToWebviewMessage,
    WebviewConfig,
    WebviewToExtensionMessage
};
