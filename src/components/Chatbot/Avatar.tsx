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
      {/* Avatar - Simple text initial */}
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
        S
      </div>
    </div>
  );
}

export default Avatar;
