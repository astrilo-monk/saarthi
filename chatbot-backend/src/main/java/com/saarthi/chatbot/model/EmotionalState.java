package com.saarthi.chatbot.model;

/**
 * Represents the emotional state detected from user messages.
 * Categories are designed to support users experiencing mental health challenges.
 */
public enum EmotionalState {
    SAD,           // Sadness, depression, low mood, feeling down
    ANXIOUS,       // Anxiety, worry, fear, panic
    HOPELESS,      // Hopelessness, worthlessness, despair
    NEUTRAL,       // No strong emotional signal
    CRITICAL       // RESERVED FOR CRISIS/SELF-HARM DETECTION ONLY
}
