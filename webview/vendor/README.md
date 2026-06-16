# Vendored webview libraries

This directory contains small browser-ready files that are used by the webview
at runtime but should not pull their full npm dependency trees into the VSIX.

## dom-to-image-even-more

- Source package: `dom-to-image-even-more`
- Vendored version: `1.0.4`
- Source file: `node_modules/dom-to-image-even-more/dist/dom-to-image-more.min.js`
- License file: `node_modules/dom-to-image-even-more/LICENSE`

The file is copied into `webview/dist/` during `npm run compile:webview`.
`webview/vendor/**` is excluded from the VSIX because only the generated
`webview/dist/` files are needed at runtime.

To update this vendor file:

1. Install the desired version temporarily:
   `npm install dom-to-image-even-more@<version> --save-dev`
2. Copy `node_modules/dom-to-image-even-more/dist/dom-to-image-more.min.js` to
   `webview/vendor/dom-to-image-more.min.js`.
3. Copy `node_modules/dom-to-image-even-more/LICENSE` to
   `webview/vendor/dom-to-image-even-more.LICENSE.txt`.
4. Remove the temporary npm dependency:
   `npm uninstall dom-to-image-even-more`
5. Run `npm run check` and `vsce package`.
