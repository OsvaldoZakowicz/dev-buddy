import { parseMarkdownToHtml } from './mdParser.js';
import {
  activateChat,
  clearInput,
  makeMsg,
  makeMsgLoading,
  makeMsgError,
  makeIndicator,
  hiddeLogoElement,
  changeTitleContainerDirection,
  reduceTitleTextSize,
  reduceSubTitleTextSize,
} from './domControl.js';

// API
const API = '/api/chat.php';
const API_MODELS = '/api/models.php';

// parametros constantes
const LOGO_HIDDEN_CLASS = 'logo-container--hidden';
const TITLE_CONTAINER_CLASS = 'title-container--sm';
const TITLE_SM_CLASS = 'title--sm';
const SUBTITLE_SM_CLASS = 'subtitle--sm';
const CHAT_ACTIVE_CLASS = 'chat-output--active';
const QUESTION_CLASS = 'question';
const QUESTION_TITLE_CLASS = 'question-to';
const ANSWER_CLASS = 'answer';
const ANSWER_TITLE_CLASS = 'answer-from';
const ANSWER_ERROR_CLASS = 'answer error';
const LOADING_CLASS = 'loading';
const LOADING_TEXT = 'chambeando ...';

// elementos del dom
const logoContainer = document.querySelector('.logo-container');
const titleContainer = document.querySelector('.title-container');
const title = document.querySelector('.title');
const subtitle = document.querySelector('.subtitle');
const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatBtnSend = document.querySelector('.btn-send');
const chatOutput = document.querySelector('.chat-output');
const modelSelector = document.getElementById('model-selector');
const keepAliveSelector = document.getElementById('keep-alive-selector');

// contador de requests pendientes
let pendingRequests = 0;

// documento cargado y listo para obtener modelos
document.addEventListener('DOMContentLoaded', () => {
  loadModels();
  setupUnloadProtection();
});

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

/**
 * funcion principal para enviar prompts a modelo
 * y retornar respuesta en formato html
 */
async function sendMessage() {
  const prompt = chatInput.value.trim();
  const model = modelSelector.value;
  const keepAlive = keepAliveSelector.value;

  // validar input vacio
  if (!prompt) {
    alert('prompt vacio!');
    return;
  }

  // validar modelo no seleccionado
  if (!model) {
    alert('seleccione un modelo!');
    return;
  }

  // activar chat
  activateChat(chatOutput, CHAT_ACTIVE_CLASS);
  // ocultar logo devbuddy
  hiddeLogoElement(logoContainer, LOGO_HIDDEN_CLASS);
  // cambiar direccion del contenedor de titulos
  changeTitleContainerDirection(titleContainer, TITLE_CONTAINER_CLASS);
  // reducir tamaño de textos
  reduceTitleTextSize(title, TITLE_SM_CLASS);
  reduceSubTitleTextSize(subtitle, SUBTITLE_SM_CLASS);

  // agregar pregunta al chat
  addQuestionToChat(prompt, model);

  // mostrar indicador de carga
  const loadingId = addLoadingMsgToChat();

  incrementPendingRequests();

  try {
    // llamar a la api
    const response = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: model,
        keep_alive: parseInt(keepAlive),
      }),
    });

    const answer = await response.json();

    // remover loading
    removeLoadingMsgFromChat(loadingId);

    // manejar respuesta
    if (answer.success) {
      addAnswerToChat(answer);
    } else {
      addErrorMsgToChat(`error: ${answer.error}`, ANSWER_ERROR_CLASS);
    }
  } catch (error) {
    removeLoadingMsgFromChat(loadingId);
    addErrorMsgToChat(
      `error de conexion: ${error.message}`,
      ANSWER_ERROR_CLASS,
    );
  } finally {
    decrementPendingRequests();
  }
}

/**
 * agregar prompt realizado por el usuario
 * @param {string} question prompt del usuario
 */
function addQuestionToChat(question, model) {
  const msg = makeMsg(question, {
    msgClasses: [QUESTION_CLASS],
    isFragmentContent: false,
    titleClasses: [QUESTION_TITLE_CLASS],
    titleContent: model,
  });
  chatOutput.appendChild(msg);
  clearInput(chatInput);
}

/**
 * agregar respuesta del modelo IA al chat
 * @param {*} answer respuesta del modelo
 */
function addAnswerToChat(answer) {
  const fragment = parseMarkdownToHtml(answer.data);
  const msg = makeMsg(fragment, {
    msgClasses: [ANSWER_CLASS],
    isFragmentContent: true,
    titleClasses: [ANSWER_TITLE_CLASS],
    titleContent: answer.model,
  });
  chatOutput.appendChild(msg);
}

/**
 * agrega un mensaje de error al chat
 * @param {string} errorText
 */
function addErrorMsgToChat(errorText) {
  const errorMsg = makeMsgError(ANSWER_ERROR_CLASS, errorText);
  chatOutput.appendChild(errorMsg);
}

/**
 * agrega un mensaje de carga al chat mientras se envia el prompt al modelo
 * @returns id del mensaje de carga
 */
function addLoadingMsgToChat() {
  const id = `loading-${Date.now()}`;
  const loadingMsg = makeMsgLoading(
    id,
    [LOADING_CLASS, ANSWER_CLASS],
    LOADING_TEXT,
  );
  chatOutput.appendChild(loadingMsg);
  return id;
}

// remover mensaje por id
function removeLoadingMsgFromChat(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ----------------------------------------------------------------------
// gestion de indicador de requests pendientes a modelos
// comportamiento al intentar recargar pagina durante requests pendientes

/**
 * configurar proteccion contra recarga accidental
 * nota: los navegadores modernos muestran un mensaje generico
 * los mensajes personalizados fueron deprecados por seguridad
 */
function setupUnloadProtection() {
  window.addEventListener('beforeunload', (e) => {
    if (pendingRequests > 0) {
      e.preventDefault();
      e.returnValue = ''; // requerido para chrome/edge
      return ''; // fallback para navegadores antiguos
    }
  });
}

function incrementPendingRequests() {
  pendingRequests++;
  updatePendingIndicator();
}

function decrementPendingRequests() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  updatePendingIndicator();
}

/**
 * actualizar o crear un indicador de request pendiente
 * y agegarlo al dom
 */
function updatePendingIndicator() {
  const existingIndicator = document.getElementById('pending-indicator');

  if (pendingRequests > 0) {
    if (!existingIndicator) {
      const indicator = makeIndicator(
        'pending-indicator',
        'pending-indicator',
        `procesando: ${pendingRequests}`,
      );
      document.body.appendChild(indicator);
    } else {
      indicator.textContent = `procesando: ${pendingRequests}`;
    }
  } else {
    if (existingIndicator) {
      existingIndicator.remove();
    }
  }
}
