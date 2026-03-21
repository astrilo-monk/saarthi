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
      <div className={`max-w-xs lg:max-w-md ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Message Content */}
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? "bg-blue-100 text-blue-900 rounded-br-none"
              : isCrisis
              ? "bg-red-50 text-red-900 border-2 border-red-300 rounded-bl-none"
              : "text-gray-100 rounded-bl-none"
          }`}
          style={
            !isUser && !isCrisis
              ? {
                  backgroundColor: accentColor + "20", // 20% opacity
                  color: textColor,
                  borderLeft: `4px solid ${accentColor}`,
                }
              : {}
          }
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </div>

        {/* Metadata (timestamp, emotion) */}
        <div className={`flex items-center gap-2 mt-1 text-xs ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && emotion && (
            <span
              className="px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: accentColor }}
            >
              {emotion}
            </span>
          )}
          {timestamp && <span className="text-gray-400">{formatTime(timestamp)}</span>}
        </div>

        {/* Crisis Warning Badge */}
        {isCrisis && (
          <div className="mt-2 bg-red-100 border border-red-300 rounded px-2 py-1">
            <p className="text-xs font-bold text-red-800">🚨 CRISIS SUPPORT</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MessageBubble;
