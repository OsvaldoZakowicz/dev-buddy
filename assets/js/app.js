import { parseMarkdownToHtml } from './mdParser.js';
import {
  activateChat,
  scrollToBottom,
  clearInput,
  addMsgToChat,
} from './domControl.js';

// API
const API = '/api/chat.php';
const API_MODELS = '/api/models.php';

// parametros constantes
const CHAT_ACTIVE_CLASS = 'chat-output--active';
const QUESTION_CLASS = 'question';
const ANSWER_CLASS = 'answer';
const ANSWER_ERROR_CLASS = 'answer error';
const LOADING_CLASS = 'loading';
const LOADING_TEXT = 'chambeando ...';

// elementos del dom
const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatBtnSend = document.querySelector('.btn-send');
const chatOutput = document.querySelector('.chat-output');
const modelSelector = document.getElementById('model-selector');

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

/**
 * carga la lista de modelos disponibles desde ollama
 * y popula el select
 * * ver listener al final del archivo
 */
async function loadModels() {
  try {
    // fetch() a models.php
    // Response {status: 200, headers: {...}, body: {...} ...}
    const response = await fetch(API_MODELS);

    // procesamos a json
    // {success: true, models: [...]}
    const data = await response.json();

    if (!data.success || data.models.length === 0) {
      // no hay modelos disponibles
      modelSelector.innerHTML =
        '<option value="">no hay modelos disponibles en ollama</option>';
      modelSelector.disabled = true;
      return;
    }

    // limpiar select
    modelSelector.innerHTML = '';

    // agregar modelos al select como opciones
    data.models.forEach((model) => {
      const option = document.createElement('option');
      option.value = model.name;

      let displayText = model.name;
      if (model.parameter_size && model.quantization_level) {
        displayText = `${model.name} (${model.parameter_size}, ${model.quantization_level})`;
      }

      option.textContent = displayText;
      modelSelector.appendChild(option);
    });

    // habilitar select
    modelSelector.disabled = false;
  } catch (error) {
    console.error('error cargando modelos:', error);
    modelSelector.innerHTML =
      '<option value="">error al cargar modelos</option>';
    modelSelector.disabled = true;
  }
}

// funcion principal para enviar mensaje
async function sendMessage() {
  const prompt = chatInput.value.trim();

  // validar input vacio
  if (!prompt) return;

  // activar chat
  activateChat(chatOutput, CHAT_ACTIVE_CLASS);

  // agregar pregunta al chat
  addQuestionToChat(prompt);

  // mostrar indicador de carga
  const loadingId = addLoadingMsgToChat();

  try {
    // llamar a la api
    const response = await fetch(API, {
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
      addAnswerToChat(data.data, ANSWER_CLASS);
    } else {
      addErrorMsgToChat(`error: ${data.error}`, ANSWER_ERROR_CLASS);
    }
  } catch (error) {
    removeLoadingMsgFromChat(loadingId);
    addErrorMsgToChat(
      `error de conexion: ${error.message}`,
      ANSWER_ERROR_CLASS,
    );
  }
}

/**
 * agregar prompt realizado por el usuario
 * @param {string} question prompt del usuario
 */
function addQuestionToChat(question) {
  addMsgToChat(chatOutput, question, QUESTION_CLASS);
  clearInput(chatInput);
}

/**
 * agregar respuesta del modelo IA al chat
 * @param {*} answer respuesta del modelo
 */
function addAnswerToChat(answer) {
  const fragment = parseMarkdownToHtml(answer);
  addMsgToChat(chatOutput, fragment, ANSWER_CLASS, { isFragment: true });
}

/**
 * agrega un mensaje de error al chat
 * @param {string} errorText
 */
function addErrorMsgToChat(errorText) {
  addMsgToChat(chatOutput, errorText, ANSWER_ERROR_CLASS);
}

/**
 * agrega un mensaje de carga al chat mientras se envia el prompt al modelo
 * @returns id del mensaje de carga
 */
function addLoadingMsgToChat() {
  const id = `loading-${Date.now()}`;
  return addMsgToChat(chatOutput, LOADING_TEXT, ANSWER_CLASS, {
    id,
    isLoading: true,
    loadingClass: LOADING_CLASS,
  });
}

// remover mensaje por id
function removeLoadingMsgFromChat(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

// documento cargado y listo para obtener modelos
document.addEventListener('DOMContentLoaded', () => {
  loadModels();
});
