# DevBuddy

Interfaz web minimalista para pair programming con IA, ejecutándose completamente en local mediante Docker y Ollama.

## ¿Qué es DevBuddy?

DevBuddy es un asistente de programación conversacional que te permite interactuar con modelos de lenguaje especializados en código directamente desde tu navegador, sin dependencias de servicios externos ni APIs de pago.

**Objetivo:** Proveer una herramienta simple, portable y privada para asistir en tareas de desarrollo, debugging, revisión de código y aprendizaje de nuevas tecnologías.

## Tecnologías

- **Frontend:** HTML5, CSS3 vanilla, JavaScript ES6+
- **Backend:** PHP 8.3
- **IA:** Ollama (soporta qwen2.5-coder, deepseek-coder, codellama, etc.)
- **Infraestructura:** Docker, Docker Compose

## Funcionalidades

✅ Chat conversacional con modelos de IA locales
✅ Selección dinámica de modelos instalados
✅ Interfaz responsive con paleta DeepSea
✅ Detección automática de modelos disponibles en Ollama
✅ Sin tracking, sin costos, sin límites de uso

## Requisitos

Tener instalado:

- Docker Engine 20.10+
- Docker Compose 2.0+

**Nota:** Si tenés Ollama instalado localmente, debés detenerlo antes de levantar DevBuddy (`systemctl stop ollama` o `brew services stop ollama`) para evitar conflictos en el puerto 11434.

## Configuración

1. Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

2. Ajusta los valores en `.env` según tu hardware:

- `OLLAMA_TIMEOUT`: Aumenta si tienes modelos grandes o hardware limitado
- `OLLAMA_TEMPERATURE`: Ajusta para respuestas más creativas (0.9) o determinísticas (0.3)

3. Levanta los servicios:

```bash
docker compose up -d
```

4. Descarga tu primer modelo:

```bash
docker exec -it dev-buddy-ollama ollama pull qwen2.5-coder:3b
```

5. Accede a la interfaz: http://localhost:9092

y listo :D
