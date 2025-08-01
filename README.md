# Claude Code Router

> A powerful routing proxy that enables Claude Code to work with any LLM provider - no Anthropic account required. Route requests to different models based on context, cost, or custom rules.

![](blog/images/claude-code.png)

## ✨ Key Features

- **🔀 Intelligent Model Routing**: Automatically route requests to different models based on task type (background tasks, reasoning, long context, web search)
- **🌐 Universal Provider Support**: Works with OpenRouter, DeepSeek, Ollama, Gemini, Volcengine, Alibaba Cloud, and any OpenAI-compatible API
- **🔧 Request/Response Transformation**: Built-in transformers adapt requests for different provider APIs automatically
- **💱 Dynamic Model Switching**: Switch models on-the-fly using `/model provider,model` command in Claude Code
- **🤖 GitHub Actions Integration**: Run Claude Code in CI/CD pipelines with custom models
- **🔌 Extensible Plugin System**: Create custom transformers and routing logic
- **🔒 Security Features**: API key authentication and host restrictions for secure deployment
- **📊 Cost Optimization**: Route background tasks to cheaper/local models automatically

## 🚀 Getting Started

### 1. Installation

First, ensure you have [Claude Code](https://docs.anthropic.com/en/docs/claude-code/quickstart) installed:

```shell
npm install -g @anthropic-ai/claude-code
```

Then, install Claude Code Router:

```shell
npm install -g @musistudio/claude-code-router
```

### 2. Configuration

Create your configuration file at `~/.claude-code-router/config.json`. See `config.example.json` for a complete example.

#### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `PROXY_URL` | string | HTTP proxy for API requests | - |
| `LOG` | boolean | Enable logging to `~/.claude-code-router.log` | `false` |
| `APIKEY` | string | API key for authentication (Bearer token or x-api-key header) | - |
| `HOST` | string | Server host address (restricted to 127.0.0.1 without APIKEY) | `127.0.0.1` |
| `API_TIMEOUT_MS` | number | API request timeout in milliseconds | `600000` |
| `Providers` | array | Model provider configurations | Required |
| `Router` | object | Routing rules for different scenarios | Required |
| `CUSTOM_ROUTER_PATH` | string | Path to custom routing logic | - |

#### Example Configuration

```json
{
  "APIKEY": "your-secret-key",
  "PROXY_URL": "http://127.0.0.1:7890",
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "sk-xxx",
      "models": [
        "google/gemini-2.5-pro-preview",
        "anthropic/claude-sonnet-4",
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3.7-sonnet:thinking"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    },
    {
      "name": "deepseek",
      "api_base_url": "https://api.deepseek.com/chat/completions",
      "api_key": "sk-xxx",
      "models": ["deepseek-chat", "deepseek-reasoner"],
      "transformer": {
        "use": ["deepseek"],
        "deepseek-chat": {
          "use": ["tooluse"]
        }
      }
    },
    {
      "name": "ollama",
      "api_base_url": "http://localhost:11434/v1/chat/completions",
      "api_key": "ollama",
      "models": ["qwen2.5-coder:latest"]
    },
    {
      "name": "gemini",
      "api_base_url": "https://generativelanguage.googleapis.com/v1beta/models/",
      "api_key": "sk-xxx",
      "models": ["gemini-2.5-flash", "gemini-2.5-pro"],
      "transformer": {
        "use": ["gemini"]
      }
    },
    {
      "name": "volcengine",
      "api_base_url": "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      "api_key": "sk-xxx",
      "models": ["deepseek-v3-250324", "deepseek-r1-250528"],
      "transformer": {
        "use": ["deepseek"]
      }
    },
    {
      "name": "modelscope",
      "api_base_url": "https://api-inference.modelscope.cn/v1/chat/completions",
      "api_key": "",
      "models": ["Qwen/Qwen3-Coder-480B-A35B-Instruct", "Qwen/Qwen3-235B-A22B-Thinking-2507"],
      "transformer": {
        "use": [
          [
            "maxtoken",
            {
              "max_tokens": 65536
            }
          ],
          "enhancetool"
        ],
        "Qwen/Qwen3-235B-A22B-Thinking-2507": {
          "use": ["reasoning"]
        }
      }
    },
    {
      "name": "dashscope",
      "api_base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      "api_key": "",
      "models": ["qwen3-coder-plus"],
      "transformer": {
        "use": [
          [
            "maxtoken",
            {
              "max_tokens": 65536
            }
          ],
          "enhancetool"
        ]
      }
    }
  ],
  "Router": {
    "default": "deepseek,deepseek-chat",
    "background": "ollama,qwen2.5-coder:latest",
    "think": "deepseek,deepseek-reasoner",
    "longContext": "openrouter,google/gemini-2.5-pro-preview",
    "longContextThreshold": 60000,
    "webSearch": "gemini,gemini-2.5-flash"
  }
}
```

### 3. Usage

#### Quick Start

```shell
# Start Claude Code with the router
ccr code

# Check server status
ccr status

# Restart after config changes
ccr restart

# Stop the router
ccr stop
```

#### Command Reference

| Command | Description |
|---------|-------------|
| `ccr start` | Start the router server |
| `ccr stop` | Stop the router server |
| `ccr restart` | Restart the router server |
| `ccr status` | Check server status |
| `ccr code [prompt]` | Run Claude Code through the router |
| `ccr provider add` | Add a new provider |
| `ccr provider list` | List configured providers |
| `ccr provider edit` | Edit provider configuration |
| `ccr provider supported` | Show supported providers |

#### Provider Examples

Here are examples for popular providers:

##### OpenAI
```bash
ccr provider add openai https://api.openai.com/v1/chat/completions sk-xxxxx gpt-4o,gpt-4o-mini,o1,o1-mini
```

##### Azure OpenAI
```bash
# Replace YOUR-RESOURCE and YOUR-DEPLOYMENT with your actual values
ccr provider add azure-openai "https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2024-08-01-preview" "your-api-key" "gpt-4o"
```

For Azure OpenAI:
- Replace `YOUR-RESOURCE` with your Azure OpenAI resource name
- Replace `YOUR-DEPLOYMENT` with your deployment name
- Find your API key in Azure Portal under "Keys and Endpoint"

##### Google Gemini
```bash
ccr provider add gemini https://generativelanguage.googleapis.com/v1beta/models/ your-api-key gemini-2.0-flash,gemini-1.5-pro
```

##### Anthropic
```bash
ccr provider add anthropic https://api.anthropic.com/v1/messages your-api-key claude-3-5-sonnet-latest,claude-3-5-haiku-latest
```

##### DeepSeek
```bash
ccr provider add deepseek https://api.deepseek.com/chat/completions your-api-key deepseek-chat,deepseek-reasoner
```

See [Provider Examples Documentation](docs/provider-examples.md) for more detailed configurations.

#### Providers

The `Providers` array is where you define the different model providers you want to use. Each provider object requires:

- `name`: A unique name for the provider.
- `api_base_url`: The full API endpoint for chat completions.
- `api_key`: Your API key for the provider.
- `models`: A list of model names available from this provider.
- `transformer` (optional): Specifies transformers to process requests and responses.

#### Transformers

Transformers allow you to modify the request and response payloads to ensure compatibility with different provider APIs.

- **Global Transformer**: Apply a transformer to all models from a provider. In this example, the `openrouter` transformer is applied to all models under the `openrouter` provider.
  ```json
  {
    "name": "openrouter",
    "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
    "api_key": "sk-xxx",
    "models": [
      "google/gemini-2.5-pro-preview",
      "anthropic/claude-sonnet-4",
      "anthropic/claude-3.5-sonnet"
    ],
    "transformer": { "use": ["openrouter"] }
  }
  ```
- **Model-Specific Transformer**: Apply a transformer to a specific model. In this example, the `deepseek` transformer is applied to all models, and an additional `tooluse` transformer is applied only to the `deepseek-chat` model.

  ```json
  {
    "name": "deepseek",
    "api_base_url": "https://api.deepseek.com/chat/completions",
    "api_key": "sk-xxx",
    "models": ["deepseek-chat", "deepseek-reasoner"],
    "transformer": {
      "use": ["deepseek"],
      "deepseek-chat": { "use": ["tooluse"] }
    }
  }
  ```

- **Passing Options to a Transformer**: Some transformers, like `maxtoken`, accept options. To pass options, use a nested array where the first element is the transformer name and the second is an options object.
  ```json
  {
    "name": "siliconflow",
    "api_base_url": "https://api.siliconflow.cn/v1/chat/completions",
    "api_key": "sk-xxx",
    "models": ["moonshotai/Kimi-K2-Instruct"],
    "transformer": {
      "use": [
        [
          "maxtoken",
          {
            "max_tokens": 16384
          }
        ]
      ]
    }
  }
  ```

**Available Built-in Transformers:**

| Transformer | Description | Use Case |
|-------------|-------------|----------|
| `deepseek` | Adapts for DeepSeek API | DeepSeek models |
| `gemini` | Adapts for Gemini API | Google Gemini models |
| `openrouter` | Adapts for OpenRouter API | OpenRouter models |
| `groq` | Adapts for Groq API | Groq-hosted models |
| `maxtoken` | Sets custom max_tokens | Token limit control |
| `tooluse` | Optimizes tool_choice | Tool-capable models |
| `enhancetool` | Enhanced tool handling | Advanced tool usage |
| `reasoning` | Optimizes for reasoning | Thinking/reasoning models |
| `gemini-cli` | Unofficial Gemini support | Experimental |

**Custom Transformers:**

You can also create your own transformers and load them via the `transformers` field in `config.json`.

```json
{
  "transformers": [
    {
      "path": "$HOME/.claude-code-router/plugins/gemini-cli.js",
      "options": {
        "project": "xxx"
      }
    }
  ]
}
```

#### Router

The `Router` object defines which model to use for different scenarios:

- `default`: The default model for general tasks.
- `background`: A model for background tasks. This can be a smaller, local model to save costs.
- `think`: A model for reasoning-heavy tasks, like Plan Mode.
- `longContext`: A model for handling long contexts (e.g., > 60K tokens).
- `longContextThreshold` (optional): The token count threshold for triggering the long context model. Defaults to 60000 if not specified.
- `webSearch`: Used for handling web search tasks and this requires the model itself to support the feature. If you're using openrouter, you need to add the `:online` suffix after the model name.

**Dynamic Model Switching:**

Switch models on-the-fly in Claude Code:

```
/model provider_name,model_name
```

Examples:
- `/model openrouter,anthropic/claude-3.5-sonnet`
- `/model deepseek,deepseek-chat`
- `/model gemini,gemini-2.5-pro`

#### Custom Router

For more advanced routing logic, you can specify a custom router script via the `CUSTOM_ROUTER_PATH` in your `config.json`. This allows you to implement complex routing rules beyond the default scenarios.

In your `config.json`:

```json
{
  "CUSTOM_ROUTER_PATH": "$HOME/.claude-code-router/custom-router.js"
}
```

The custom router file must be a JavaScript module that exports an `async` function. This function receives the request object and the config object as arguments and should return the provider and model name as a string (e.g., `"provider_name,model_name"`), or `null` to fall back to the default router.

Here is an example of a `custom-router.js` based on `custom-router.example.js`:

```javascript
// $HOME/.claude-code-router/custom-router.js

/**
 * A custom router function to determine which model to use based on the request.
 *
 * @param {object} req - The request object from Claude Code, containing the request body.
 * @param {object} config - The application's config object.
 * @returns {Promise<string|null>} - A promise that resolves to the "provider,model_name" string, or null to use the default router.
 */
module.exports = async function router(req, config) {
  const userMessage = req.body.messages.find((m) => m.role === "user")?.content;

  if (userMessage && userMessage.includes("explain this code")) {
    // Use a powerful model for code explanation
    return "openrouter,anthropic/claude-3.5-sonnet";
  }

  // Fallback to the default router configuration
  return null;
};
```

## 🤖 GitHub Actions Integration

Use Claude Code Router in your CI/CD pipelines to leverage different models for automated tasks. After setting up [Claude Code Actions](https://docs.anthropic.com/en/docs/claude-code/github-actions), modify your workflow:

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]
  # ... other triggers

jobs:
  claude:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      # ... other conditions
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
      issues: read
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Prepare Environment
        run: |
          curl -fsSL https://bun.sh/install | bash
          mkdir -p $HOME/.claude-code-router
          cat << 'EOF' > $HOME/.claude-code-router/config.json
          {
            "log": true,
            "OPENAI_API_KEY": "${{ secrets.OPENAI_API_KEY }}",
            "OPENAI_BASE_URL": "https://api.deepseek.com",
            "OPENAI_MODEL": "deepseek-chat"
          }
          EOF
        shell: bash

      - name: Start Claude Code Router
        run: |
          nohup ~/.bun/bin/bunx @musistudio/claude-code-router@1.0.8 start &
        shell: bash

      - name: Run Claude Code
        id: claude
        uses: anthropics/claude-code-action@beta
        env:
          ANTHROPIC_BASE_URL: http://localhost:3456
        with:
          anthropic_api_key: "any-string-is-ok"
```

This enables cost-effective automations:
- Use cheaper models for routine tasks
- Schedule resource-intensive operations during off-peak hours
- Route to specialized models based on task requirements

## 🆕 Recent Improvements

### v1.1.0 Features
- **🔄 Intelligent Retry Logic**: Automatic retries with exponential backoff for transient failures
- **🛡️ Circuit Breaker**: Prevents cascading failures by temporarily disabling failing providers
- **📋 Configuration Validation**: JSON schema validation with helpful error messages
- **🔥 Hot Configuration Reload**: Update config without restarting the service
- **📊 Enhanced Logging**: Structured logging with Winston, log rotation, and debug mode
- **⚡ Graceful Shutdown**: Proper cleanup and connection draining on service stop
- **🎯 Better Error Messages**: Clear, actionable error messages with suggested fixes

## 🔧 Troubleshooting

### Common Issues

1. **"API error (connection error)"**
   - Check your API keys and base URLs
   - Verify network connectivity and proxy settings
   - Ensure the router service is running (`ccr status`)
   - Check logs at `~/.claude-code-router/logs/` for details

2. **Model not responding**
   - Verify the model name in your config
   - Check if the provider supports the model
   - Review transformer compatibility
   - Enable debug mode: set `LOG_LEVEL: "debug"` in config

3. **"No allowed providers available"**
   - Ensure at least one provider is configured
   - Check provider API key validity
   - Verify model names match provider's supported models
   - Run config validation: The service will validate on startup

4. **Configuration errors**
   - The service now validates configuration on startup
   - Check for detailed error messages in the console
   - See [Configuration Schema](docs/configuration-schema.md) for all options

## 📝 Documentation

- [Configuration Schema](docs/configuration-schema.md) - Detailed configuration options and validation rules
- [Project Motivation and How It Works](blog/en/project-motivation-and-how-it-works.md)
- [Maybe We Can Do More with the Router](blog/en/maybe-we-can-do-more-with-the-route.md)

## 📄 License

This project is licensed under the MIT License.
