/**
 * useEmotionTheme Hook
 *
 * Maps emotional states to UI theme (colors, animations, avatar expressions).
 * Provides both light and dark mode colors.
 */

export interface EmotionTheme {
  accentColor: string;
  accentColorDark: string;
  avatarExpression: string;
  avatarAnimation: string;
  label: string;
}

export interface EmotionThemes {
  [key: string]: EmotionTheme;
}

const EMOTION_THEMES: EmotionThemes = {
  SAD: {
    accentColor: "#5b9aa0",
    accentColorDark: "#6bbac2",
    avatarExpression: "😔",
    avatarAnimation: "breathing",
    label: "Sadness",
  },
  ANXIOUS: {
    accentColor: "#a67ba7",
    accentColorDark: "#c49bc5",
    avatarExpression: "😰",
    avatarAnimation: "pulse",
    label: "Anxiety",
  },
  HOPELESS: {
    accentColor: "#8b6b6b",
    accentColorDark: "#b08e8e",
    avatarExpression: "😢",
    avatarAnimation: "slow_breathing",
    label: "Reaching out",
  },
  NEUTRAL: {
    accentColor: "#5b9aa0",
    accentColorDark: "#6bbac2",
    avatarExpression: "🙂",
    avatarAnimation: "steady",
    label: "Neutral",
  },
  CRITICAL: {
    accentColor: "#e05555",
    accentColorDark: "#f06060",
    avatarExpression: "🤝",
    avatarAnimation: "attentive",
    label: "Crisis",
  },
};

/**
 * Hook to get theme data for a specific emotion
 */
export function useEmotionTheme(emotion: string): EmotionTheme {
  return EMOTION_THEMES[emotion] || EMOTION_THEMES.NEUTRAL;
}

/**
 * Hook to get CSS animation keyframes for emotion animations
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
