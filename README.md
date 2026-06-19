# CodeSnap Neo

📸 Take beautiful screenshots of your code in VS Code!
And you can highlight the line just by clicking the line number.

<!-- TOC -->

- [CodeSnap Neo](#codesnap-neo)
    - [Features](#features)
    - [Basic Usage Instructions](#basic-usage-instructions)
    - [Highlight Usage Instructions](#highlight-usage-instructions)
    - [Configuration](#configuration)
    - [Acknowledgements](#acknowledgements)

<!-- /TOC -->

![UI](https://raw.githubusercontent.com/veritas-arch/codesnap-neo/main/image/showcase_test.png)

## Features

- Can highlight the line if you click line number
- Highlight has 3 styles:
    - focus
    - git-add
    - git-remove

(For usage, see the **Highlight Usage Instructions**)

- **Original features of CodeSnap**
    - Quickly save screenshots of your code
    - Copy screenshots to your clipboard
    - Show line numbers
    - Many other configuration options

## Basic Usage Instructions

1. Open the command palette (Ctrl+Shift+P on Windows and Linux, Cmd+Shift+P on OS X) and search for `CodeSnap Neo`.
2. Select the code you'd like to screenshot.
3. Use **Copy** to place the image on the clipboard, or **Save** to write a PNG file.

**Tips**:

- You can also start CodeSnap by selecting code, right clicking, and clicking CodeSnap
- If you'd like to bind CodeSnap to a hotkey, open up your keyboard shortcut settings and bind `codesnap-neo.start` to a custom keybinding.
- Use the **Copy** button to copy the image to the clipboard, or **Save** to write it to a PNG file.

## Highlight Usage Instructions

If you want to highlight the line, click the line number and the line will be highlighted.

- Click once: Style **focus**
- Click twice: Style **git-add**
- Click thrice: Style **git-remove**
- Click four times: No hightlight

## Configuration

CodeSnap Neo provides two settings for line-number output:

**`codesnap-neo.showLineNumbers`:** Boolean value to show or hide line numbers.

**`codesnap-neo.realLineNumbers`:** Boolean value to start from the real line number of the file instead of 1.

## Acknowledgements

CodeSnap Neo is based on [CodeSnap-plus](https://github.com/huibizhang/CodeSnap-plus), with modernization work and additional fixes maintained in this repository.

The great [Polacode](https://github.com/octref/polacode), for the initial concept.

[Carbon](https://carbon.now.sh/) for some design inspiration.
