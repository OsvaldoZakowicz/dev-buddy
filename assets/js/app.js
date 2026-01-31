// elementos del dom
const chatForm = document.querySelector('.chat-content form');
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

  // agregar pregunta al chat
  addMessage(prompt, 'question');

  // limpiar input
  chatInput.value = '';

  // mostrar indicador de carga
  const loadingId = addMessage('pensando...', 'answer', true);

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
    removeMessage(loadingId);

    // manejar respuesta
    if (data.success) {
      addMessage(data.data, 'answer');
    } else {
      addMessage(`error: ${data.error}`, 'answer error');
    }
  } catch (error) {
    removeMessage(loadingId);
    addMessage(`error de conexion: ${error.message}`, 'answer error');
  }
}

// agregar mensaje al chat
function addMessage(text, type, isLoading = false) {
  const messageEl = document.createElement('p');
  messageEl.className = type;
  messageEl.textContent = text;

  // id unico para mensajes de loading
  if (isLoading) {
    const id = `loading-${Date.now()}`;
    messageEl.id = id;
    messageEl.classList.add('loading');
  }

  chatOutput.appendChild(messageEl);
  scrollToBottom();

  return isLoading ? messageEl.id : null;
}

// remover mensaje por id
function removeMessage(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

// scroll automatico al ultimo mensaje
function scrollToBottom() {
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// limpiar chat (opcional, para usar despues)
function clearChat() {
  chatOutput.innerHTML = '';
}
