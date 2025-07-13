# qbraid-chat-app

Qbraid Chat App is a Visual Studio Code extension that brings an interactive AI powered chat interface directly into the editor. It allows users to authenticate with an API key, select a chat model, and communicate with Qbraid's API in a conversational format.

## Features

* Provides an interactive chat interface within VS Code, allowing users to communicate with Qbraid’s API directly from the editor.
* Supports API key validation, dynamic model selection via a dropdown, and displays a loader while waiting for responses.
* API is requested everytime user starts the extension such that, user need not save their API key everytime they change it by going inside deep unknown paths.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

If the API key is prompted as invalid, then it is invalid. Please make sure you type the exact key.
> Always use `Ctrl+C` to copy and `Ctr+V` to paste such kind of information.

If you observe any delay in the response for your question, please check your internet connection.
