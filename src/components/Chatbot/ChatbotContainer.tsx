/**
 * ChatbotContainer Component
 *
 * Simplified chatbot interface focused on text-based mental health support.
 * - Clean message display with animation
 * - Emotion-aware theming
 * - Crisis detection/response
 * - Text input only (camera/mic removed for simplicity)
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useChatbot from "@/hooks/useChatbot";
import { useEmotionTheme } from "@/hooks/useEmotionTheme";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";

interface ChatbotContainerProps {
  initialMessage?: string;
  onEmotionChange?: (emotion: string) => void;
  onCrisisDetected?: () => void;
}

export function ChatbotContainer({
  initialMessage,
  onEmotionChange,
  onCrisisDetected,
}: ChatbotContainerProps) {
  const { messages, isLoading, error, currentEmotion, isCrisis, sendMessage, clearError } =
    useChatbot();
  const theme = useEmotionTheme(currentEmotion);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Wrap sendMessage to show user message immediately
  const handleSendMessage = useCallback((message: string) => {
    setLastUserMessage(message);
    sendMessage(message);
  }, [sendMessage]);

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current;
      const endElement = messagesEndRef.current;
      const scrollTop = endElement.offsetTop - container.offsetTop;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Notify parent when emotion changes
  useEffect(() => {
    onEmotionChange?.(currentEmotion);
  }, [currentEmotion, onEmotionChange]);

  // Notify parent on crisis
  useEffect(() => {
    if (isCrisis) {
      onCrisisDetected?.();
    }
  }, [isCrisis, onCrisisDetected]);

  // Clear last user message when response arrives
  useEffect(() => {
    if (!isLoading && lastUserMessage && messages.length > 0) {
      setLastUserMessage(null);
    }
  }, [isLoading, messages]);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      sendMessage(initialMessage);
    }
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="chatbot-container flex flex-col rounded-2xl overflow-hidden shadow-2xl h-full"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Header */}
      <motion.div
        className="chatbot-header p-4 flex flex-col items-center gap-2 border-b"
        style={{ borderColor: theme.accentColor + "40" }}
      >
        <h1 className="text-xl font-semibold" style={{ color: theme.textColor }}>
          Saarthi
        </h1>
        <p className="text-xs" style={{ color: theme.textColor + "99" }}>
          {isCrisis
            ? "Crisis support available — please reach out to a helpline"
            : "Your private mental health companion"}
        </p>
      </motion.div>

      {/* Messages Container */}
      <motion.div
        ref={messagesContainerRef}
        className="chatbot-messages flex-1 overflow-y-auto p-6 space-y-4"
        style={{ backgroundColor: theme.backgroundColor }}
        layout
      >
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full text-center"
          >
            <div>
              <p className="text-2xl font-semibold mb-3" style={{ color: theme.textColor }}>
                How can I help?
              </p>
              <p style={{ color: theme.textColor + "99" }}>
                Share what's on your mind. I'm here to listen and support you.
              </p>
              <p className="text-xs mt-4" style={{ color: theme.textColor + "66" }}>
                Your conversation is private and anonymous.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* User Message */}
              <MessageBubble
                isUser={true}
                message={msg.userMessage}
                timestamp={msg.timestamp}
              />

              {/* AI Response */}
              <MessageBubble
                isUser={false}
                message={msg.aiResponse}
                emotion={msg.detectedEmotion}
                isCrisis={msg.isCrisis}
                timestamp={msg.timestamp}
                accentColor={theme.accentColor}
                textColor={theme.textColor}
              />
            </div>
          ))}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && lastUserMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {/* Show pending user message */}
            <MessageBubble
              isUser={true}
              message={lastUserMessage}
            />
            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 p-4 rounded"
          >
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 text-xs underline mt-2 hover:text-red-800"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </motion.div>

      {/* Footer - Input Box */}
      <motion.div
        className="chatbot-footer p-6 border-t"
        style={{
          borderColor: theme.accentColor + "40",
          backgroundColor: theme.backgroundColor
        }}
      >
        <InputBox
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          accentColor={theme.accentColor}
          placeholderText="Share your thoughts..."
        />
      </motion.div>
    </motion.div>
  );
}

export default ChatbotContainer;
