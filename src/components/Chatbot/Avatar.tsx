/**
 * Avatar Component
 *
 * Displays an animated avatar (emoji-based) with emotional expressions.
 * Changes expression and animation based on detected emotion.
 * Smooth transitions between emotional states.
 */

import React, { useEffect, useState } from "react";
import { useEmotionTheme, getEmotionAnimationStyles } from "@/hooks/useEmotionTheme";

interface AvatarProps {
  expression: string;
  animation: string;
  emotion: string;
}

export function Avatar({ expression, animation, emotion }: AvatarProps) {
  const theme = useEmotionTheme(emotion);
  const [displayExpression, setDisplayExpression] = useState(expression);

  // Smooth transition when emotion changes
  useEffect(() => {
    setDisplayExpression(expression);
  }, [expression]);

  // Add animation styles to document if not already present
  useEffect(() => {
    if (!document.querySelector("#emotion-animations")) {
      const style = document.createElement("style");
      style.id = "emotion-animations";
      style.textContent = getEmotionAnimationStyles();
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="emotion-avatar-container flex flex-col items-center gap-2">
      {/* Avatar Emoji */}
      <div
        className={`emotion-avatar-emoji emotion-avatar-${animation} text-6xl transition-all duration-300 ease-in-out`}
        role="img"
        aria-label={`Chatbot avatar expressing ${emotion.toLowerCase()}`}
      >
        {displayExpression}
      </div>

      {/* Emotion Label (optional, can be hidden) */}
      <div className="emotion-label text-xs font-medium" style={{ color: theme.textColor }}>
        {emotion}
      </div>

      {/* Emotion Indicator Bar */}
      <div className="emotion-indicator w-12 h-1 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>

      <style jsx>{`
        .emotion-avatar-emoji {
          display: inline-block;
          line-height: 1;
          animation: ${animation} 2s ease-in-out infinite;
        }

        @keyframes breathing {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.03);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes slow_breathing {
          0% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.8;
          }
        }

        @keyframes steady {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes attentive {
          0% {
            transform: translateY(0);
          }
          10% {
            transform: translateY(-2px);
          }
          20% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Avatar;
