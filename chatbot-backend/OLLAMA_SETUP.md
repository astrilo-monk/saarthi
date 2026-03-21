# Ollama Setup Guide for Campus Calm Chatbot

## Overview
The chatbot backend has been switched from OpenAI API to **Ollama**, which runs AI models locally on your machine. This means:
- ✅ No API keys required
- ✅ No API costs
- ✅ Models run entirely on your computer
- ✅ Complete privacy (no data sent to external services)

## Installation

### Windows
1. Download Ollama from: https://ollama.ai
2. Run the installer and follow the prompts
3. Ollama will start automatically as a background service

### Mac
```bash
# Using Homebrew
brew install ollama

# Or download from https://ollama.ai
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Starting Ollama

### Windows
- Ollama starts automatically when you install it
- Look for the Ollama icon in your system tray
- To manually start: Search for "Ollama" in Start menu

### Mac/Linux
```bash
ollama serve
```

Ollama will run on `http://localhost:11434`

## Pulling a Model

Before running the chatbot, you need to download an LLM model. Run:

```bash
ollama pull neural-chat
```

### Model Options
The chatbot is configured to use `neural-chat` by default, but you can use alternatives:

| Model | Size | Speed | Quality | RAM Needed |
|-------|------|-------|---------|-----------|
| neural-chat | 4.1GB | Fast | Good | 8GB+ |
| mistral | 4.1GB | Fast | Good | 8GB+ |
| llama2 | 3.8GB | Medium | Good | 8GB+ |
| phi | 1.6GB | Very Fast | Fair | 4GB+ |
| orca-mini | 1.3GB | Very Fast | Fair | 4GB+ |

**Recommendation**: Start with `neural-chat` for best balance

## Changing the Model

Edit `chatbot-backend/src/main/resources/application.properties`:

```properties
ollama.model=neural-chat  # Change this to any model you've pulled
```

## Verifying Ollama is Running

Check if Ollama is accessible:
```bash
curl http://localhost:11434/api/tags
```

You should see a JSON response with available models.

## Starting the Chatbot Backend

From the `chatbot-backend` directory:

```bash
# Build
mvn clean package

# Run
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## Troubleshooting

### "Connection refused" error
- Make sure Ollama is running (`ollama serve` on Mac/Linux or check system tray on Windows)
- Ensure it's on port 11434

### "Model not found" error
- Pull the model first: `ollama pull neural-chat`
- Or configure a different model in `application.properties`

### Slow responses or out of memory
- Reduce the model size (use `phi` or `orca-mini`)
- Increase available RAM
- Close other applications

### Check Ollama logs
```bash
# Mac/Linux
# Check system logs for ollama-related messages

# Windows
# Check Event Viewer or Ollama app logs
```

## Performance Tips

1. **First run is slow**: Model will be loaded into memory first time
2. **Keep Ollama running**: Don't close the process between requests
3. **Monitor RAM**: Open Task Manager (Windows) or Activity Monitor (Mac) to check system load
4. **Use lighter models for slower machines**: `phi` or `orca-mini`

## Configuration Tuning

In `application.properties`:

```properties
# Lower values = faster, less accurate
ollama.temperature=0.7

# Sampling parameter (0-1)
ollama.top-p=0.9

# Diversity parameter
ollama.top-k=40
```

Lower `temperature` = more predictable responses
Higher `temperature` = more creative responses

## Switching Back to OpenAI (if needed)

If you need to revert to OpenAI API:
1. Restore the `OpenAIClient.java` class
2. Update `ChatService.java` to use `OpenAIClient`
3. Update `application.properties` with OpenAI configuration
4. Set `OPENAI_API_KEY` environment variable
