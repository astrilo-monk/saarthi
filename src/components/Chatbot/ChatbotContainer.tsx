/**
 * ChatbotContainer Component
 *
 * Main wrapper component for the AI mental health chatbot.
 * Orchestrates all chat functionality:
 * - Message display with animation
 * - Emotion-aware theming
 * - Avatar with emotional expressions
 * - User input
 * - Crisis detection/response
 *
 * Fully emotion-aware - changes colors, avatar, and animations based on detected emotion.
 */

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useChatbot from "@/hooks/useChatbot";
import { useEmotionTheme } from "@/hooks/useEmotionTheme";
import Avatar from "./Avatar";
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Notify parent when emotion changes
  useEffect(() => {
    onEmotionChange?.(currentEmotion);
  }, [currentEmotion, onEmotionChange]);

  // Notify parent when crisis detected
  useEffect(() => {
    if (isCrisis) {
      onCrisisDetected?.();
    }
  }, [isCrisis, onCrisisDetected]);

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
      className="chatbot-container flex flex-col h-full rounded-lg overflow-hidden shadow-lg"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Header with Avatar */}
      <motion.div
        className="chatbot-header p-6 flex flex-col items-center gap-4 border-b-2"
        style={{ borderColor: theme.accentColor + "40" }}
      >
        <Avatar
          expression={messages.length === 0 ? "🙂" : messages[messages.length - 1].avatar.expression}
          animation={messages.length === 0 ? "steady" : messages[messages.length - 1].avatar.animation}
          emotion={currentEmotion}
        />
        <h1 className="text-2xl font-bold" style={{ color: theme.textColor }}>
          Saarthi Mental Health Support
        </h1>
        <p className="text-sm" style={{ color: theme.textColor + "99" }}>
          {isCrisis
            ? "🚨 Crisis support available - please reach out"
            : "I'm here to listen and support you"}
        </p>
      </motion.div>

      {/* Messages Container */}
      <motion.div
        className="chatbot-messages flex-1 overflow-y-auto p-6 space-y-4"
        layout
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full text-center"
          >
            <div>
              <p className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>
                Welcome to Saarthi
              </p>
              <p style={{ color: theme.textColor + "99" }}>
                Share what's on your mind. I'm here to listen and support you with care and understanding.
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
        {isLoading && (
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
      <motion.div className="chatbot-footer p-6 border-t-2" style={{ borderColor: theme.accentColor + "40" }}>
        <InputBox
          onSubmit={sendMessage}
          isLoading={isLoading}
          accentColor={theme.accentColor}
          placeholderText="Share your thoughts, feelings, or concerns..."
        />
      </motion.div>
    </motion.div>
  );
}

export default ChatbotContainer;
