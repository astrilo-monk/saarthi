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
      className={`message-bubble flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div className={`${isUser ? "items-end" : "items-start"} flex flex-col gap-2 max-w-md`}>
        {/* Message Box */}
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? "bg-green-100 text-gray-800"
              : isCrisis
              ? "bg-red-100 text-red-900"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-gray-500 px-1">
            {formatTime(timestamp)}
          </span>
        )}

        {/* Emotion Label for AI responses */}
        {!isUser && emotion && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
            {emotion}
          </span>
        )}

        {/* Crisis label */}
        {isCrisis && (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-200 text-red-800">
            🚨 CRISIS SUPPORT
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default MessageBubble;
