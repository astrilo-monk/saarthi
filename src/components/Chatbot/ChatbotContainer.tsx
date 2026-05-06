/**
 * ChatbotContainer Component
 *
 * Premium chatbot interface for mental health support.
 * - Dark-mode native design with glassmorphism
 * - Emotion-aware accent colors
 * - Smooth animations and transitions
 * - Crisis detection/response
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, Heart } from "lucide-react";
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
  const { messages, isLoading, error, currentEmotion, isCrisis, sendMessage, clearMessages, clearError } =
    useChatbot();
  const theme = useEmotionTheme(currentEmotion);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="chatbot-container flex flex-col rounded-2xl overflow-hidden h-full
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        shadow-xl dark:shadow-2xl dark:shadow-black/30
        transition-colors duration-300"
    >
      {/* Header */}
      <div className="chatbot-header px-6 py-4 flex items-center justify-between
        border-b border-gray-100 dark:border-gray-800
        bg-gray-50/80 dark:bg-gray-900/80
        backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-sage-green flex items-center justify-center shadow-md">
            <Heart className="w-4.5 h-4.5 text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-base font-heading font-bold text-foreground dark:text-gray-100">
              Saarthi
            </h1>
            <p className="text-xs font-paragraph text-gray-500 dark:text-gray-500">
              {isCrisis
                ? "Crisis support — please reach out to a helpline"
                : "Your private mental health companion"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearMessages}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title="New conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="chatbot-messages flex-1 overflow-y-auto px-6 py-6 space-y-1
          bg-gradient-to-b from-white via-white to-gray-50
          dark:from-gray-950 dark:via-gray-950 dark:to-gray-900
          transition-colors duration-300"
      >
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center max-w-sm">
              {/* Decorative Icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-sage-green/10 dark:from-primary/20 dark:to-sage-green/20 flex items-center justify-center mx-auto mb-6 border border-primary/10 dark:border-primary/20"
              >
                <Sparkles className="w-7 h-7 text-primary dark:text-green-400" />
              </motion.div>

              <h2 className="text-xl font-heading font-bold text-foreground dark:text-gray-100 mb-2">
                How can I help?
              </h2>
              <p className="font-paragraph text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
                Share what's on your mind. I'm here to listen and support you.
              </p>
              <p className="text-xs font-paragraph text-gray-400 dark:text-gray-600">
                Your conversation is private and anonymous.
              </p>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {["I'm feeling stressed", "Can't sleep well", "Need someone to talk to"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-3.5 py-2 text-xs font-paragraph rounded-xl
                      bg-gray-100 dark:bg-gray-800
                      text-gray-600 dark:text-gray-400
                      border border-gray-200 dark:border-gray-700
                      hover:border-primary/40 dark:hover:border-green-500/40
                      hover:bg-primary/5 dark:hover:bg-green-500/5
                      hover:text-primary dark:hover:text-green-400
                      transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
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
            <div className="flex items-center gap-3 pl-1">
              <div className="flex gap-1.5 items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay }}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 rounded-xl"
          >
            <p className="text-red-700 dark:text-red-400 text-sm font-paragraph">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 text-xs underline mt-2 hover:text-red-800 dark:hover:text-red-300 font-paragraph"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer - Input Box */}
      <div className="chatbot-footer px-6 py-4
        border-t border-gray-100 dark:border-gray-800
        bg-gray-50/80 dark:bg-gray-900/80
        backdrop-blur-sm">
        <InputBox
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          accentColor={theme.accentColor}
          placeholderText="Share your thoughts..."
        />
      </div>
    </motion.div>
  );
}

export default ChatbotContainer;
