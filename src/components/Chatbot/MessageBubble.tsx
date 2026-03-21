/**
 * MessageBubble Component
 *
 * Displays individual chat messages in conversation.
 * Styles differ for user vs. assistant messages.
 * Shows timestamp and emotion indicators for assistant messages.
 */

import React from "react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  isUser: boolean;
  message: string;
  timestamp?: string;
  emotion?: string;
  isCrisis?: boolean;
  accentColor?: string;
  textColor?: string;
}

export function MessageBubble({
  isUser,
  message,
  timestamp,
  emotion,
  isCrisis,
  accentColor = "#5b9aa0",
  textColor = "#2c3e50",
}: MessageBubbleProps) {
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`message-bubble flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`max-w-2xl ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Message Content - Clean minimal style */}
        <div
          className={`px-0 py-2 ${
            isUser
              ? "text-right"
              : isCrisis
              ? "text-left"
              : "text-left"
          }`}
        >
          <p className={`text-sm leading-relaxed ${isUser ? "text-gray-800" : "text-gray-700"}`}>
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
