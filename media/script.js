const chat = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const modelDropdown = document.getElementById('modelInput');
const vscode = acquireVsCodeApi();

// To append a message to the chat window with the specified sender and text
function appendMessage(sender, text) {
  const div = document.createElement('div');
  div.className = 'message ' + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// To append a loader message (three blinking dots) to the chat window while waiting for a response
function appendLoaderMessage() {
  const loaderDiv = document.createElement('div');
  loaderDiv.className = 'message bot';
  loaderDiv.id = 'loaderMessage';
  loaderDiv.innerHTML = '<div class="loader"><span>.</span><span>.</span><span>.</span></div>';
  chat.appendChild(loaderDiv);
  chat.scrollTop = chat.scrollHeight;
  return loaderDiv;
}

// The available models are loaded from the API using the provided API key through GET request
function loadModels() {
  fetch('https://api.qbraid.com/api/chat/models', {
    method: 'GET',
    headers: { 'api-key': apiKey }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load models: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      modelDropdown.innerHTML = '';
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.model;
        option.textContent = item.model;
        modelDropdown.appendChild(option);
      });
    })
    .catch(error => {
      console.error(error);
      modelDropdown.innerHTML = '<option value="">Error loading models</option>';
    });
}

// LoadModels is triggered as soon as the webview loads
loadModels();

// When the send button is clicked, post a message to the extension
sendBtn.addEventListener('click', () => {
  const msg = messageInput.value;
  if (!msg) return;
  appendMessage('user', msg);
  const loader = appendLoaderMessage();
  const model = modelDropdown.value;
  vscode.postMessage({ command: 'chatMessage', prompt: msg, model: model });
  messageInput.value = '';
});

// After receiving the response from the API endpoint, the message is appended to the chat window by removing the loader
window.addEventListener('message', event => {
  const message = event.data;
  if (message.command === 'chatResponse') {
    const loaderElement = document.getElementById('loaderMessage');
    if (loaderElement) {
      loaderElement.remove();
    }
    appendMessage('bot', message.text);
  }
});
