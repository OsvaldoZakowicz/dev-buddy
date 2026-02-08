import { parseMarkdownToHtml } from './mdParser.js';

// elementos del dom
const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatBtnSend = document.querySelector('.btn-send');
const chatOutput = document.querySelector('.chat-output');

// prevenir submit default y manejar envio
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await sendMessage();
});

// submit con enter, shift+enter para nueva linea
chatInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    await sendMessage();
  }
});

// submit con boton de envio
chatBtnSend.addEventListener('click', async (e) => {
  e.preventDefault();
  await sendMessage();
});

// funcion principal para enviar mensaje
async function sendMessage() {
  const prompt = chatInput.value.trim();

  // validar input vacio
  if (!prompt) return;

  // mostrar chat
  showChat();

  // agregar pregunta al chat
  addQuestionToChat(prompt, 'question');

  // mostrar indicador de carga
  const loadingId = addLoadingMsgToChat('pensando ...', 'answer');

  try {
    // llamar a la api
    const response = await fetch('/api/chat.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    // remover loading
    removeLoadingMsgFromChat(loadingId);

    // manejar respuesta
    if (data.success) {
      addAnswerToChat(data.data, 'answer');
    } else {
      addErrorMsgToChat(`error: ${data.error}`, 'answer error');
    }
  } catch (error) {
    removeLoadingMsgFromChat(loadingId);
    addErrorMsgToChat(`error de conexion: ${error.message}`, 'answer error');
  }
}

// mostrar chat por primera vez
function showChat() {
  if (chatOutput.classList.contains('chat-output--active')) {
    return;
  }

  chatOutput.classList.add('chat-output--active');
}

/**
 * agregar prompt realizado por el usuario
 * @param {*} question prompt del usuario
 * @param {*} className clase a incluir en el elemento html representativo del mensaje
 */
function addQuestionToChat(question, className) {
  const messageElement = document.createElement('div');
  messageElement.className = className;
  messageElement.textContent = question;
  chatOutput.appendChild(messageElement);
  scrollToBottom();
  clearInput();
}

/**
 * agregar respuesta del modelo IA al chat
 * @param {*} answer respuesta del modelo
 * @param {*} className clase a incluir en el elemento html representativo del mensaje
 */
function addAnswerToChat(answer, className) {
  const messageElement = document.createElement('div');
  messageElement.className = className;
  messageElement.appendChild(parseMarkdownToHtml(answer));
  chatOutput.appendChild(messageElement);
  scrollToBottom();
}

function addErrorMsgToChat(errorText, className) {
  const messageElement = document.createElement('div');
  messageElement.className = className;
  messageElement.textContent = errorText;
  chatOutput.appendChild(messageElement);
  scrollToBottom();
}

/**
 * agregar un mensaje de carga al chat mientras se envia el prompt al modelo
 * @param {*} loadingText texto a mostrar en el mensaje
 * @param {*} className clase a incluir en el elemento html representativo del mensaje
 * @returns id del mensaje de carga
 */
function addLoadingMsgToChat(loadingText, className) {
  const messageElement = document.createElement('div');
  messageElement.className = className;
  messageElement.textContent = loadingText;
  const id = `loading-${Date.now()}`;
  messageElement.id = id;
  messageElement.classList.add('loading');
  chatOutput.appendChild(messageElement);
  return messageElement.id;
}

// remover mensaje por id
function removeLoadingMsgFromChat(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

// scroll automatico al ultimo mensaje
function scrollToBottom() {
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// limpiar input
function clearInput() {
  chatInput.value = '';
}

// limpiar chat (opcional, para usar despues)
function clearChat() {
  chatOutput.innerHTML = '';
}
