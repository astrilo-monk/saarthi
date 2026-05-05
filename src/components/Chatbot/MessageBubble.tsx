/**
 * MessageBubble Component
 *
 * Displays individual chat messages in conversation.
 * User messages: right-aligned, dark bg
 * AI messages: left-aligned with emotion indicator badge
 * Crisis messages: highlighted with red accent and helpline emphasis
 */

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

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

  const emotionInfo = emotion ? EMOTION_LABELS[emotion.toUpperCase()] || null : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`message-bubble flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`${isUser ? "items-end" : "items-start"} flex flex-col gap-1 max-w-xl`}>
        {/* Crisis Alert Banner */}
        {isCrisis && !isUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-200 rounded-lg text-red-700 text-xs font-medium"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Crisis support — please reach out to a helpline below</span>
          </motion.div>
        )}

        {/* Message Box */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gray-800 text-white rounded-br-sm"
              : isCrisis
              ? "bg-red-50 border border-red-100 text-red-900 rounded-bl-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>

        {/* Metadata - Time and Emotion below message */}
        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          {timestamp && <span>{formatTime(timestamp)}</span>}
          {!isUser && emotionInfo && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: isCrisis ? '#fef2f2' : (accentColor + '15'),
                color: isCrisis ? '#dc2626' : accentColor,
              }}
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
