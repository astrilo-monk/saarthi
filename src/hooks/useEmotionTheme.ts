/**
 * useEmotionTheme Hook
 *
 * Maps emotional states to UI theme (colors, animations, avatar expressions).
 * Provides a consistent interface for emotion-aware theming across the app.
 */

export interface EmotionTheme {
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  avatarExpression: string;
  avatarAnimation: string;
}

export interface EmotionThemes {
  [key: string]: EmotionTheme;
}

const EMOTION_THEMES: EmotionThemes = {
  SAD: {
    backgroundColor: "#e8f4f8",
    accentColor: "#5b9aa0",
    textColor: "#2c3e50",
    avatarExpression: "😔",
    avatarAnimation: "breathing"
  },
  ANXIOUS: {
    backgroundColor: "#f5e6f0",
    accentColor: "#a67ba7",
    textColor: "#402840",
    avatarExpression: "😰",
    avatarAnimation: "pulse"
  },
  HOPELESS: {
    backgroundColor: "#faf0f0",
    accentColor: "#8b6b6b",
    textColor: "#3d2a2a",
    avatarExpression: "😢",
    avatarAnimation: "slow_breathing"
  },
  NEUTRAL: {
    backgroundColor: "#f9f9f9",
    accentColor: "#7b9fa3",
    textColor: "#333333",
    avatarExpression: "🙂",
    avatarAnimation: "steady"
  },
  CRITICAL: {
    backgroundColor: "#fff3e0",
    accentColor: "#ff6f3c",
    textColor: "#5d4037",
    avatarExpression: "🤝",
    avatarAnimation: "attentive"
  }
};

/**
 * Hook to get theme data for a specific emotion
 * @param emotion The emotional state (SAD, ANXIOUS, HOPELESS, NEUTRAL, CRITICAL)
 * @returns EmotionTheme object with colors and animations
 */
export function useEmotionTheme(emotion: string): EmotionTheme {
  return EMOTION_THEMES[emotion] || EMOTION_THEMES.NEUTRAL;
}

/**
 * Hook to get CSS animation keyframes for emotion animations
 * @returns CSS string with all animation definitions
 */
export function getEmotionAnimationStyles(): string {
  return `
    @keyframes breathing {
      0% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
      100% { opacity: 0.8; transform: scale(1); }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      25% { transform: scale(1.03); }
      50% { transform: scale(1); }
      75% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }

    @keyframes slow_breathing {
      0% { opacity: 0.8; }
      50% { opacity: 1; }
      100% { opacity: 0.8; }
    }

    @keyframes steady {
      0% { opacity: 1; }
      100% { opacity: 1; }
    }

    @keyframes attentive {
      0% { transform: translateY(0); }
      10% { transform: translateY(-2px); }
      20% { transform: translateY(0); }
      100% { transform: translateY(0); }
    }

    @keyframes glow {
      0% { filter: drop-shadow(0 0 0 rgba(255, 111, 60, 0)); }
      50% { filter: drop-shadow(0 0 8px rgba(255, 111, 60, 0.6)); }
      100% { filter: drop-shadow(0 0 0 rgba(255, 111, 60, 0)); }
    }

    .emotion-avatar-breathing {
      animation: breathing 2s ease-in-out infinite;
    }

    .emotion-avatar-pulse {
      animation: pulse 1.5s ease-in-out infinite;
    }

    .emotion-avatar-slow_breathing {
      animation: slow_breathing 3s ease-in-out infinite;
    }

    .emotion-avatar-steady {
      animation: steady 1s linear infinite;
    }

    .emotion-avatar-attentive {
      animation: attentive 2s ease-in-out infinite;
    }

    .emotion-avatar-glow {
      animation: glow 2s ease-in-out infinite;
    }
  `;
}

export default useEmotionTheme;
