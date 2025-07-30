# Provider Configuration Examples

This document provides detailed examples for configuring various LLM providers with ccr-next.

## Table of Contents
- [OpenAI](#openai)
- [Azure OpenAI](#azure-openai)
- [Anthropic](#anthropic)
- [Google Gemini](#google-gemini)
- [DeepSeek](#deepseek)
- [Groq](#groq)
- [OpenRouter](#openrouter)

## OpenAI

OpenAI is natively supported without requiring any transformer, as the @musistudio/llms package uses OpenAI's API format as its base standard.

### Command Line
```bash
ccr provider add openai https://api.openai.com/v1/chat/completions sk-xxxxx gpt-4o,gpt-4o-mini,o1,o1-mini
```

### Configuration
```json
{
  "name": "openai",
  "api_base_url": "https://api.openai.com/v1/chat/completions",
  "api_key": "sk-xxxxx",
  "models": ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini"]
  // No transformer needed - OpenAI format is the default
}
```

### Optional: Using the OpenAI Optimization Transformer
If you want to optimize Claude Code's verbose system prompts for better performance with OpenAI models, you can use the included optimization transformer:

```json
{
  "name": "openai",
  "api_base_url": "https://api.openai.com/v1/chat/completions",
  "api_key": "sk-xxxxx",
  "models": ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini"],
  "transformer": {
    "use": ["./plugins/openai.js"]
  }
}
```

This transformer:
- Condenses Claude Code's system prompt to be more OpenAI-friendly
- Sets appropriate defaults: `max_tokens: 4096`, `temperature: 0.7`
- Removes Claude-specific instructions for cleaner prompts

## Azure OpenAI

Azure OpenAI requires specific configuration based on your deployment.

### Command Line
```bash
# Replace YOUR-RESOURCE with your Azure resource name
# Replace YOUR-DEPLOYMENT with your deployment name
ccr provider add azure-openai "https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2024-08-01-preview" "your-api-key" "gpt-4o"
```

### Configuration
```json
{
  "name": "azure-openai",
  "api_base_url": "https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2024-08-01-preview",
  "api_key": "xxxxx",
  "models": ["gpt-4o"], // Should match your deployment name
  // No transformer needed
}
```

### Important Notes for Azure OpenAI:
1. Replace `YOUR-RESOURCE` with your actual Azure OpenAI resource name
2. Replace `YOUR-DEPLOYMENT` with your actual deployment name
3. The model name should match your deployment name
4. API version can be updated to the latest available version
5. Find your API key in the Azure Portal under "Keys and Endpoint"

## Anthropic

### Command Line
```bash
ccr provider add anthropic https://api.anthropic.com/v1/messages your-api-key claude-3-5-sonnet-latest,claude-3-5-haiku-latest,claude-3-opus-latest
```

### Configuration
```json
{
  "name": "anthropic",
  "api_base_url": "https://api.anthropic.com/v1/messages",
  "api_key": "sk-ant-xxxxx",
  "models": ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
  "transformer": {
    "use": ["Anthropic"]
  }
}
```

## Google Gemini

### Command Line
```bash
ccr provider add gemini https://generativelanguage.googleapis.com/v1beta/models/ your-api-key gemini-2.0-flash,gemini-2.0-flash-thinking,gemini-1.5-pro
```

### Configuration
```json
{
  "name": "gemini",
  "api_base_url": "https://generativelanguage.googleapis.com/v1beta/models/",
  "api_key": "AIzaSyXXXXX",
  "models": ["gemini-2.0-flash", "gemini-2.0-flash-thinking", "gemini-1.5-pro"],
  "transformer": {
    "use": ["gemini"]
  }
}
```

## DeepSeek

### Command Line
```bash
ccr provider add deepseek https://api.deepseek.com/chat/completions your-api-key deepseek-chat,deepseek-reasoner
```

### Configuration
```json
{
  "name": "deepseek",
  "api_base_url": "https://api.deepseek.com/chat/completions",
  "api_key": "sk-xxxxx",
  "models": ["deepseek-chat", "deepseek-reasoner"],
  "transformer": {
    "use": ["deepseek"]
  }
}
```

## Groq

### Command Line
```bash
ccr provider add groq https://api.groq.com/openai/v1/chat/completions your-api-key llama-3.3-70b-versatile,mixtral-8x7b-32768,llama-3.1-8b-instant
```

### Configuration
```json
{
  "name": "groq",
  "api_base_url": "https://api.groq.com/openai/v1/chat/completions",
  "api_key": "gsk_xxxxx",
  "models": ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.1-8b-instant"],
  "transformer": {
    "use": ["groq"]
  }
}
```

## OpenRouter

### Command Line
```bash
ccr provider add openrouter https://openrouter.ai/api/v1/chat/completions your-api-key anthropic/claude-3.5-sonnet,google/gemini-2.0-flash-exp,openai/gpt-4o
```

### Configuration
```json
{
  "name": "openrouter",
  "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
  "api_key": "sk-or-v1-xxxxx",
  "models": [
    "anthropic/claude-3.5-sonnet",
    "google/gemini-2.0-flash-exp",
    "openai/gpt-4o",
    "meta-llama/llama-3.1-405b-instruct"
  ],
  "transformer": {
    "use": ["openrouter"]
  }
}
```

## Router Configuration Examples

After adding providers, configure routing for different scenarios:

```json
"Router": {
  // Default route for general requests
  "default": "openai,gpt-4o",
  
  // Background tasks (e.g., auto-completions)
  "background": "deepseek,deepseek-chat",
  
  // Thinking/reasoning tasks
  "think": "deepseek,deepseek-reasoner",
  
  // Long context requests
  "longContext": "gemini,gemini-1.5-pro",
  "longContextThreshold": 60000,
  
  // Web search enabled requests
  "webSearch": "openrouter,google/gemini-2.0-flash-exp"
}
```

## Tips

1. **API Keys**: Always keep your API keys secure. Consider using environment variables.
2. **Model Names**: Ensure model names match exactly what the provider expects.
3. **Transformers**: Most providers now have automatic transformer detection in ccr-next v1.1.4+
4. **Testing**: After adding a provider, test with `ccr code "Hello world"` to ensure it's working.
5. **Multiple Providers**: You can add multiple providers and use routing rules to distribute requests.

## Getting API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Azure OpenAI**: Azure Portal → Your OpenAI Resource → Keys and Endpoint
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google Gemini**: https://aistudio.google.com/app/apikey
- **DeepSeek**: https://platform.deepseek.com/api_keys
- **Groq**: https://console.groq.com/keys
- **OpenRouter**: https://openrouter.ai/keys