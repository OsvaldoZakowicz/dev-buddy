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

// ============================================
// parser de markdown para respuestas del modelo
// ============================================

/**
 * parsea texto markdown y retorna fragment con nodos dom
 * @param {string} text - texto en formato markdown
 * @returns {DocumentFragment} fragment con nodos html
 */
function parseMarkdownToHtml(text) {
  if (!text) return document.createDocumentFragment();

  const fragment = document.createDocumentFragment();
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // detectar inicio de bloque de codigo
    if (line.trim().startsWith('```')) {
      const codeBlock = extractCodeBlock(lines, i);
      fragment.appendChild(codeBlock.element);
      i = codeBlock.nextIndex;
      continue;
    }

    // procesar linea normal (puede contener codigo inline)
    const processedLine = processInlineCode(line);

    // solo agregar parrafos si la linea no esta vacia
    if (processedLine.trim()) {
      const p = document.createElement('p');
      p.innerHTML = processedLine;
      fragment.appendChild(p);
    }

    i++;
  }

  return fragment;
}

/**
 * extrae un bloque de codigo completo
 * @param {array} lines - array de lineas del texto
 * @param {number} startIndex - indice donde inicia el bloque
 * @returns {object} objeto con elemento dom y siguiente indice
 */
function extractCodeBlock(lines, startIndex) {
  const firstLine = lines[startIndex].trim();
  const language = firstLine.replace('```', '').trim() || 'code';

  let codeLines = [];
  let i = startIndex + 1;

  // buscar el cierre del bloque de codigo
  while (i < lines.length) {
    if (lines[i].trim() === '```') {
      break;
    }
    codeLines.push(lines[i]);
    i++;
  }

  const codeContent = codeLines.join('\n');

  // crear elementos dom
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.className = `language-${language}`;
  code.textContent = codeContent;
  pre.appendChild(code);

  return {
    element: pre,
    nextIndex: i + 1,
  };
}

/**
 * procesa codigo inline dentro de una linea
 * @param {string} line - linea de texto
 * @returns {string} linea con codigo inline convertido a html
 */
function processInlineCode(line) {
  // crear un div temporal para escapar el texto
  const temp = document.createElement('div');
  temp.textContent = line;
  let escaped = temp.innerHTML;

  // convertir codigo inline `codigo` a <code>codigo</code>
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

  return escaped;
}
