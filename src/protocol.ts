interface WebviewConfig {
    fontLigatures?: boolean | string;
    tabSize?: string | number;
    showLineNumbers: boolean;
    startLine: number;
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
