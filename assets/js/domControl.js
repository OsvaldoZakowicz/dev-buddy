// ============================================
// manejo del dom
// ============================================

/**
 *
 * @param {Element} chatOutput
 * @param {DocumentFragment|string} content
 * @param {string} className
 * @param {object} options
 * @returns id del mensaje o null
 */
export function addMsgToChat(chatOutput, content, className, options = {}) {
  const messageElement = document.createElement('div');
  messageElement.className = className;

  if (options.id) {
    messageElement.id = options.id;
  }

  if (options.isLoading && options.loadingClass) {
    messageElement.classList.add(options.loadingClass);
  }

  // determinar si el contenido es texto plano o fragment
  if (options.isFragment) {
    messageElement.appendChild(content);
  } else {
    messageElement.textContent = content;
  }

  chatOutput.appendChild(messageElement);
  scrollToBottom(chatOutput);

  return options.id || null;
}

/**
 * agrega clase CSS con estilos para mostrar el
 * chat como activo al inicio de una conversacion
 * @param {Element} chatOutput elemento html que representa el chat
 * @param {string} className clase a agregar a la lista de clases del elemento
 * @returns void
 */
export function activateChat(chatOutput, className) {
  if (chatOutput.classList.contains(className)) return;
  chatOutput.classList.add(className);
}

/**
 * limpiar input
 * @param {Element} chatInput elemento html que representa el input para prompts
 * @returns void
 */
export function clearInput(chatInput) {
  chatInput.value = '';
}

/**
 * scroll hacia el final del chat
 * @param {Element} chatOutput elemento html que representa el chat
 * @returns void
 */
export function scrollToBottom(chatOutput) {
  chatOutput.scrollTop = chatOutput.scrollHeight;
}
