/**
 * OpenAI Transformer Plugin
 * 
 * This transformer optimizes prompts for OpenAI models by:
 * 1. Condensing the Claude Code system prompt into a more OpenAI-friendly format
 * 2. Removing Claude-specific instructions
 * 3. Restructuring tool descriptions for better comprehension
 */

module.exports = function () {
  return {
    name: 'openai',
    requestInterceptor: async (server) => {
      server.addHook('preHandler', async (request) => {
        if (request.body && request.body.messages) {
          const messages = request.body.messages;
          
          // Find and transform the system message
          const systemMessageIndex = messages.findIndex(msg => msg.role === 'system');
          
          if (systemMessageIndex !== -1) {
            const systemMessage = messages[systemMessageIndex];
            
            // Transform the Claude Code system prompt to a more OpenAI-friendly version
            const transformedContent = transformSystemPrompt(systemMessage.content);
            
            messages[systemMessageIndex] = {
              ...systemMessage,
              content: transformedContent
            };
          }
          
          // Ensure max_tokens is set appropriately
          if (!request.body.max_tokens || request.body.max_tokens > 4096) {
            request.body.max_tokens = 4096;
          }
          
          // Add temperature for more consistent responses
          if (request.body.temperature === undefined) {
            request.body.temperature = 0.7;
          }
        }
      });
    },
    responseInterceptor: async (server) => {
      server.addHook('preSerialization', async (request, reply, payload) => {
        // No response transformation needed for now
        return payload;
      });
    }
  };
};

/**
 * Transform the Claude Code system prompt into a more OpenAI-friendly format
 */
function transformSystemPrompt(originalPrompt) {
  // Extract key information from the original prompt
  const hasTools = originalPrompt.includes('<function_calls>');
  const isCodeTask = originalPrompt.toLowerCase().includes('code') || 
                     originalPrompt.toLowerCase().includes('programming');
  
  // Create a condensed, OpenAI-optimized prompt
  let transformedPrompt = `You are an AI coding assistant with access to various tools for file manipulation, code analysis, and task management.

IMPORTANT INSTRUCTIONS:
1. Be concise and direct in your responses - typically 1-4 lines unless more detail is requested
2. Focus on solving the specific task at hand without unnecessary explanation
3. Use tools proactively to understand codebases and implement solutions
4. When editing files, preserve exact formatting and indentation
5. Follow existing code conventions and patterns in the project
6. Never add comments unless explicitly requested
7. Complete tasks fully before marking them as done`;

  // Add tool-specific instructions if tools are mentioned
  if (hasTools) {
    transformedPrompt += `

AVAILABLE TOOLS:
- Task: Launch agents for complex multi-step tasks
- Bash: Execute shell commands with proper quoting and error handling
- Read/Write/Edit: File manipulation with exact string matching
- Grep/Glob/LS: Search and navigate the codebase efficiently
- TodoWrite: Track and manage tasks throughout the conversation
- WebFetch/WebSearch: Access web content and search results

When using tools:
1. Call multiple tools in parallel when possible for better performance
2. Always read files before editing them
3. Use exact string matching for edits (preserve all whitespace)
4. Track complex tasks with TodoWrite
5. Verify changes with appropriate commands (lint, typecheck, tests)`;
  }

  // Add context about the current session if it's a coding task
  if (isCodeTask) {
    transformedPrompt += `

You are helping with software engineering tasks. Follow these practices:
- Understand the codebase structure before making changes
- Implement complete, working solutions
- Test your changes when possible
- Follow security best practices
- Only commit when explicitly asked`;
  }

  // If the original prompt is very long (like Claude Code's), we've condensed it
  // But preserve any user-specific instructions that might be at the end
  const userInstructionMarkers = ['IMPORTANT:', 'NOTE:', 'CUSTOM:', 'USER:'];
  for (const marker of userInstructionMarkers) {
    const markerIndex = originalPrompt.lastIndexOf(marker);
    if (markerIndex > originalPrompt.length * 0.8) { // In the last 20% of the prompt
      transformedPrompt += '\n\n' + originalPrompt.substring(markerIndex);
      break;
    }
  }
  
  return transformedPrompt;
}