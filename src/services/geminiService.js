// services/geminiService.js
//
// Single place where the app talks to Google's Gemini API.
// Components never import the SDK directly — they call the functions
// exported here. That keeps the API key, request shape, and error
// handling in one file, so the SDK could be swapped out later without
// touching any UI code.

import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

let client = null;

function getClient() {
  if (!API_KEY) {
    throw new GeminiServiceError(
      'MISSING_API_KEY',
      "Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file."
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: API_KEY });
  }
  return client;
}

// Custom error type so the UI can branch on `error.code`
// instead of parsing error strings.
export class GeminiServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
  }
}

// Converts our internal conversation shape:
//   { role: 'user' | 'assistant', content: string }
// into the shape the Gemini SDK expects:
//   { role: 'user' | 'model', parts: [{ text }] }
function toGeminiContents(messages) {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

function mapSdkError(err) {
  const message = err?.message || '';

  if (!navigator.onLine) {
    return new GeminiServiceError(
      'NETWORK_ERROR',
      "You're offline. Check your internet connection and try again."
    );
  }
  if (message.includes('API key not valid') || message.includes('API_KEY_INVALID')) {
    return new GeminiServiceError(
      'INVALID_API_KEY',
      'Your Gemini API key was rejected. Double-check VITE_GEMINI_API_KEY in your .env file.'
    );
  }
  if (message.includes('429') || message.toLowerCase().includes('quota')) {
    return new GeminiServiceError(
      'RATE_LIMIT',
      "You've hit the Gemini API rate limit. Wait a moment and try again."
    );
  }
  if (message.includes('503') || message.toLowerCase().includes('unavailable')) {
    return new GeminiServiceError(
      'SERVICE_UNAVAILABLE',
      'Gemini is temporarily unavailable. Please try again shortly.'
    );
  }
  if (err?.name === 'AbortError') {
    return new GeminiServiceError('ABORTED', 'Generation was stopped.');
  }
  return new GeminiServiceError(
    'UNKNOWN',
    "Sorry, I couldn't generate a response right now. Please try again."
  );
}

/**
 * Streams a Gemini response chunk by chunk.
 *
 * @param {Array<{role: string, content: string}>} history - prior turns, oldest first
 * @param {string} prompt - the new user message
 * @param {(chunkText: string) => void} onChunk - called with each new text chunk
 * @param {AbortSignal} [signal] - optional AbortController signal to stop generation
 * @returns {Promise<string>} the full assembled response text
 */
export async function streamGeminiResponse(history, prompt, onChunk, signal) {
  if (!prompt || !prompt.trim()) {
    throw new GeminiServiceError('EMPTY_PROMPT', 'Please enter a message before sending.');
  }

  try {
    const ai = getClient();
    const contents = [...toGeminiContents(history), { role: 'user', parts: [{ text: prompt }] }];

    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents,
    });

    let fullText = '';
    for await (const chunk of stream) {
      if (signal?.aborted) {
        throw new GeminiServiceError('ABORTED', 'Generation was stopped.');
      }
      const chunkText = chunk.text || '';
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    if (!fullText.trim()) {
      throw new GeminiServiceError(
        'EMPTY_RESPONSE',
        'Gemini returned an empty response. Please try rephrasing your prompt.'
      );
    }

    return fullText;
  } catch (err) {
    if (err instanceof GeminiServiceError) throw err;
    throw mapSdkError(err);
  }
}

/**
 * Generates a short title for a conversation from its first exchange.
 * Falls back to a truncated prompt if generation fails — this is a
 * "nice to have", never worth surfacing an error for.
 */
export async function generateChatTitle(prompt) {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Summarize this into a short chat title (max 6 words, no punctuation at the end, no quotes): "${prompt}"`,
            },
          ],
        },
      ],
    });
    const title = response.text?.trim().replace(/^"|"$/g, '');
    return title || prompt.slice(0, 40);
  } catch {
    return prompt.slice(0, 40);
  }
}
