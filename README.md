# dev-buddy

Interfaz web simple para pair programming con una IA local usando Ollama

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
