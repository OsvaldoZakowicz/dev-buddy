// ============================================
// parser de markdown a DOM para manejar
// respuestas del modelo
// ============================================

/**
 * parsea texto markdown y retorna fragment con nodos dom
 * @param {string} text - texto en formato markdown
 * @returns {DocumentFragment} fragment con nodos html
 */
export function parseMarkdownToHtml(text) {
  if (!text) {
    return;
  }

  const domFragment = document.createDocumentFragment();
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // detectar inicio de bloque de codigo
    if (line.trim().startsWith('```')) {
      // extraer bloque de codigo y dar formato
      const codeBlock = extractCodeBlock(lines, i);
      // agregar al dom fragment el bloque de codigo formateado
      domFragment.appendChild(codeBlock.element);
      // avanzar indice y continuar bucle
      i = codeBlock.nextIndex;
      continue;
    }

    // procesar linea normal (puede tener codigo inline)
    const processedLine = processInlineCode(line);
    if (processedLine.trim()) {
      const p = document.createElement('p');
      p.innerHTML = processedLine;
      domFragment.appendChild(p);
    }

    i++;
  }

  return domFragment;
}

/**
 * extrae un bloque de codigo completo
 * @param {array} lines - array de lineas del texto
 * @param {number} startIndex - indice donde inicia el bloque
 * @returns {object} objeto con elemento dom y siguiente indice
 */
function extractCodeBlock(lines, startIndex) {
  // extraer y procesar el inicio del bloque de codigo
  const firstLine = lines[startIndex].trim();
  const language = firstLine.replace('```', '').trim() || 'code';

  let codeLines = [];
  let i = startIndex + 1;

  // extrare el contenido del bloque de codigo,
  // y almacenar las lineas de codigo hasta hallar
  // el cierre del bloque
  while (i < lines.length) {
    if (lines[i].trim() === '```') {
      break;
    }
    codeLines.push(lines[i]);
    i++;
  }

  // unificar las lineas del bloque en un solo content
  const codeContent = codeLines.join('\n');

  // crear elementos dom para el bloque
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
