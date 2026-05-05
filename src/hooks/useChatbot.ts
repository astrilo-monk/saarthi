/**
 * useChatbot Hook
 *
 * Handles all communication with the chatbot backend API.
 * Manages chat state, message history, loading, and error states.
 */

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  userMessage: string;
  aiResponse: string;
  detectedEmotion: string;
  emotionConfidence: number;
  theme: {
    backgroundColor: string;
    accentColor: string;
    textColor: string;
  };
  avatar: {
    expression: string;
    animation: string;
  };
  isCrisis: boolean;
  timestamp: string;
  sessionId: string;
}

interface UseChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  currentEmotion: string;
  isCrisis: boolean;
}

const API_URL = "http://localhost:8080/api/chat";

/**
 * Hook for chatbot functionality
 * @returns Object with chat state and functions
 */
export function useChatbot() {
  const [state, setState] = useState<UseChatbotState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: generateSessionId(),
    currentEmotion: "NEUTRAL",
    isCrisis: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Sends a message to the chatbot and gets a response
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch(`${API_URL}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            sessionId: state.sessionId,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusCode}`);
        }

        const chatMessage: ChatMessage = await response.json();

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, chatMessage],
          currentEmotion: chatMessage.detectedEmotion,
          isCrisis: chatMessage.isCrisis,
          isLoading: false,
        }));

        return chatMessage;
      } catch (err) {
        // Don't set error if it was an abort
        if (!(err instanceof Error && err.name === "AbortError")) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to get response";
          console.error("Chat error:", errorMessage);

          setState((prev) => ({
            ...prev,
            error: errorMessage,
            isLoading: false,
          }));
        }
      }
    },
    [state.sessionId]
  );

  /**
   * Clears all messages and starts a new session
   */
  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      sessionId: generateSessionId(),
      currentEmotion: "NEUTRAL",
      isCrisis: false,
      error: null,
    }));
  }, []);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Cancels in-flight requests
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sessionId: state.sessionId,
    currentEmotion: state.currentEmotion,
    isCrisis: state.isCrisis,
    sendMessage,
    clearMessages,
    clearError,
    cancelRequest,
  };
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default useChatbot;
