// ============================================
// manejo del dom
// ============================================

/**
 *
 * @param {*} content
 * @param {*} options
 * @returns
 */
export function makeMsg(content, options = {}) {
  const msg = document.createElement('div');
  msg.classList.add(...options.msgClasses);
  msg.appendChild(
    makeMsgTitleElement(options.titleClasses, options.titleContent),
  );

  if (options.isFragmentContent) {
    msg.appendChild(content);
  } else {
    const p = document.createElement('p');
    p.textContent = content;
    msg.appendChild(p);
  }

  return msg;
}

/**
 * crear titulo del mensaje para chat
 * @param {string[]} titleClasses
 * @param {string} titleContent
 */
function makeMsgTitleElement(titleClasses, titleContent) {
  const span = document.createElement('span');
  span.classList.add(...titleClasses);
  span.innerText = titleContent;
  return span;
}

/**
 * crear mensaje de carga
 * @param {int} loadingId
 * @param {string[]} loadingClasses
 * @param {string} loadingTextContent
 */
export function makeMsgLoading(loadingId, loadingClasses, loadingTextContent) {
  const msg = document.createElement('div');
  msg.id = loadingId;
  msg.classList.add(...loadingClasses);

  const p = document.createElement('p');
  p.textContent = loadingTextContent;

  msg.appendChild(p);

  return msg;
}

/**
 * crear mensaje de error
 * @param {string} errorClass
 * @param {string} errorTextContent
 * @returns
 */
export function makeMsgError(errorClass, errorTextContent) {
  const msg = document.createElement('div');
  msg.className = errorClass;

  const p = document.createElement('p');
  p.textContent = errorTextContent;

  msg.appendChild(p);

  return msg;
}

/**
 *
 * @param {string} indicatorId
 * @param {string} indicatorClass
 * @param {string} indicatorTextContent
 * @returns
 */
export function makeIndicator(
  indicatorId,
  indicatorClass,
  indicatorTextContent,
) {
  const indicator = document.createElement('div');
  indicator.id = indicatorId;
  indicator.className = indicatorClass;
  indicator.textContent = indicatorTextContent;

  return indicator;
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
