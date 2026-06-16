type ShutterAction = 'save' | 'copy';
type SnapshotTarget = 'container' | 'window';
type ToolMode = 'simple' | 'advanced';

export interface WebviewConfig {
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
