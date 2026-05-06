/**
 * MessageBubble Component
 *
 * Premium chat message display.
 * User messages: right-aligned with brand gradient
 * AI messages: left-aligned with subtle background
 * Crisis messages: highlighted with red accent
 */

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Bot } from "lucide-react";

const EMOTION_LABELS: Record<string, { emoji: string; label: string }> = {
  NEUTRAL: { emoji: "😊", label: "Neutral" },
  SAD: { emoji: "😢", label: "Sadness" },
  ANXIOUS: { emoji: "😰", label: "Anxiety" },
  HOPELESS: { emoji: "💙", label: "Reaching out" },
  CRITICAL: { emoji: "🆘", label: "Crisis" },
};

interface MessageBubbleProps {
  isUser: boolean;
  message: string;
  timestamp?: string;
  emotion?: string;
  isCrisis?: boolean;
  accentColor?: string;
}

export function MessageBubble({
  isUser,
  message,
  timestamp,
  emotion,
  isCrisis,
}: MessageBubbleProps) {
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const emotionInfo = emotion ? EMOTION_LABELS[emotion.toUpperCase()] || null : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`message-bubble flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5 max-w-[80%]`}>
        {/* Crisis Alert Banner */}
        {isCrisis && !isUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
              bg-red-100 dark:bg-red-950/40
              border border-red-200 dark:border-red-900/50
              text-red-700 dark:text-red-400"
          >
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Crisis support — please reach out to a helpline</span>
          </motion.div>
        )}

        {/* AI avatar indicator */}
        {!isUser && (
          <div className="flex items-center gap-2 pl-1 mb-0.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-sage-green flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-paragraph font-medium text-gray-500 dark:text-gray-500">Saarthi</span>
          </div>
        )}

        {/* Message Box */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-white rounded-br-sm shadow-md"
              : isCrisis
              ? "bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-900 dark:text-red-200 rounded-bl-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-paragraph">{message}</p>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-600 px-1">
          {timestamp && <span className="font-paragraph">{formatTime(timestamp)}</span>}
          {!isUser && emotionInfo && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium font-paragraph
                ${isCrisis
                  ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                  : 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400'
                }`}
            >
              <span>{emotionInfo.emoji}</span>
              <span>{emotionInfo.label}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
