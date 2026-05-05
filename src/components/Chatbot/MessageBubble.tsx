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
      <div className={`${isUser ? "items-end" : "items-start"} flex flex-col gap-1 max-w-xl`}>
        {/* Message Box - Claude style */}
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? "bg-gray-200 text-gray-900"
              : isCrisis
              ? "bg-red-50 text-red-900"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </div>

        {/* Metadata - Time and Emotion below message */}
        <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
          {timestamp && <span>{formatTime(timestamp)}</span>}
          {!isUser && emotion && <span className="font-medium capitalize">{emotion}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
