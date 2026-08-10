// context/ChatContext.jsx
//
// Central state for the whole app: conversation history, the active
// conversation, theme, and in-flight request status. Exposed through
// Context so any component can read/act without prop-drilling.

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { streamGeminiResponse, generateChatTitle, GeminiServiceError } from '../services/geminiService';

const ChatContext = createContext(null);

const HISTORY_KEY = 'gemini-assistant:conversations';
const THEME_KEY = 'gemini-assistant:theme';

function loadConversations() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(loadTheme);

  const abortControllerRef = useRef(null);

  // Persist conversations whenever they change
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(conversations));
  }, [conversations]);

  // Apply + persist theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const startNewChat = useCallback(() => {
    setActiveId(null);
    setError(null);
  }, []);

  const selectConversation = useCallback((id) => {
    setActiveId(id);
    setError(null);
  }, []);

  const deleteConversation = useCallback(
    (id) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const clearAllHistory = useCallback(() => {
    setConversations([]);
    setActiveId(null);
  }, []);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Sends a prompt: creates a conversation if needed, streams the
  // assistant's reply into it token-by-token, and persists the result.
  const sendMessage = useCallback(
    async (promptText) => {
      const trimmed = promptText.trim();
      if (!trimmed || isGenerating) return;

      setError(null);
      let conversationId = activeId;
      const userMessage = { role: 'user', content: trimmed };

      if (!conversationId) {
        conversationId = crypto.randomUUID();
        const newConversation = {
          id: conversationId,
          title: trimmed.slice(0, 40),
          messages: [userMessage],
          createdAt: new Date().toISOString(),
        };
        setConversations((prev) => [newConversation, ...prev]);
        setActiveId(conversationId);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, messages: [...c.messages, userMessage] } : c
          )
        );
      }

      // Snapshot history (before the new message) for the API call
      const priorMessages = conversations.find((c) => c.id === conversationId)?.messages || [];

      const assistantMessage = { role: 'assistant', content: '' };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, messages: [...c.messages, assistantMessage] } : c
        )
      );

      setIsGenerating(true);
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const applyChunk = (chunkText) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c;
            const messages = [...c.messages];
            const lastIndex = messages.length - 1;
            messages[lastIndex] = {
              ...messages[lastIndex],
              content: messages[lastIndex].content + chunkText,
            };
            return { ...c, messages };
          })
        );
      };

      try {
        await streamGeminiResponse(priorMessages, trimmed, applyChunk, controller.signal);

        // Fire-and-forget: give the conversation a real title after
        // its first exchange, if it's still using the truncated default.
        if (priorMessages.length === 0) {
          generateChatTitle(trimmed).then((title) => {
            setConversations((prev) =>
              prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
            );
          });
        }
      } catch (err) {
        const serviceError =
          err instanceof GeminiServiceError
            ? err
            : new GeminiServiceError('UNKNOWN', 'Something went wrong. Please try again.');

        if (serviceError.code !== 'ABORTED') {
          setError(serviceError.message);
        }

        // Remove the empty/partial assistant bubble if nothing came through,
        // otherwise leave the partial text (useful for Stop Generation).
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c;
            const messages = [...c.messages];
            const last = messages[messages.length - 1];
            if (last?.role === 'assistant' && last.content === '') {
              messages.pop();
            }
            return { ...c, messages };
          })
        );
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    },
    [activeId, conversations, isGenerating]
  );

  const value = {
    conversations,
    activeConversation,
    activeId,
    isGenerating,
    error,
    setError,
    theme,
    toggleTheme,
    startNewChat,
    selectConversation,
    deleteConversation,
    clearAllHistory,
    sendMessage,
    stopGeneration,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
