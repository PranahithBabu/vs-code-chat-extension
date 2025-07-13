import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "qbraid-chat-app" is now active!');

  // Register the command to open the chat webview
  const disposable = vscode.commands.registerCommand('qbraid-chat.qbraid', async () => {
    // A prompt to enter the API key using an input box in the command palette
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your API Key',
      ignoreFocusOut: true
    });
    if (!apiKey) {
      vscode.window.showInformationMessage('API Key is required.');
      return;
    }

    // Validating the API key by calling the qbraid's GET chat models endpoint
    try {
      const response = await fetch('https://api.qbraid.com/api/chat/models', {
        method: 'GET',
        headers: { 'api-key': apiKey }
      });
      if (response.status === 401) {
        vscode.window.showInformationMessage('Unauthorized: Invalid API Key');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to validate API Key: ' + response.statusText);
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(err.message);
      return;
    }

    // After successful API validation, the chat webview is opened.
    const panel = vscode.window.createWebviewPanel(
      'chatWebview',
      'Qbraid Chat App',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
    );

    // Setting the HTML content for the webview.
    panel.webview.html = getChatWebviewContent(apiKey, panel.webview, context.extensionUri);

    // Handling messages from the webview by calling the qbraid's POST chat models endpoint.
    panel.webview.onDidReceiveMessage(async message => {
      if (message.command === 'chatMessage') {
        const { prompt, model } = message;
        try {
          const response = await fetch('https://api.qbraid.com/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey
            },
            body: JSON.stringify({
              prompt: prompt,
              model: model
            })
          });
          if (!response.ok) {
            throw new Error('Error calling chat API: ' + response.statusText);
          }
          const data = await response.json() as { content: string };
          const content = data.content;

          // Sending the chat response back to the webview.
          panel.webview.postMessage({ command: 'chatResponse', text: content });
        } catch (err: any) {
          panel.webview.postMessage({ command: 'chatResponse', text: 'Error: ' + err.message });
        }
      }
    }, undefined, context.subscriptions);
  });

  context.subscriptions.push(disposable);
}

function getChatWebviewContent(apiKey: string, webview: vscode.Webview, extensionUri: vscode.Uri): string {
  // Path to the HTML file
  const indexPath = vscode.Uri.joinPath(extensionUri, 'media', 'index.html');
  let html = fs.readFileSync(indexPath.fsPath, 'utf8');

  // Path to the css (style) and script files
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'style.css'));
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'script.js'));

  // Replacing placeholder tokens with actual values to be used in the webview
  html = html.replace(/\$\{cspSource\}/g, webview.cspSource);
  html = html.replace(/\$\{styleUri\}/g, styleUri.toString());
  html = html.replace(/\$\{scriptUri\}/g, scriptUri.toString());
  html = html.replace(/\$\{apiKey\}/g, apiKey);

  return html;
}

export function deactivate() {}
