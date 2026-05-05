package com.saarthi.chatbot.model;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration for emotion-aware theming.
 * Maps emotional states to UI colors and animations for the frontend.
 */
public class EmotionThemeConfig {

    private static final Map<EmotionalState, ThemeData> THEMES = new HashMap<>();

    static {
        // SAD: Calm, cool blue-grey colors
        THEMES.put(EmotionalState.SAD, ThemeData.builder()
                .bg("#e8f4f8")
                .accent("#5b9aa0")
                .text("#2c3e50")
                .avatarExpression("😔")
                .avatarAnimation("breathing")
                .build());

        // ANXIOUS: Soft lavender for calming
        THEMES.put(EmotionalState.ANXIOUS, ThemeData.builder()
                .bg("#f5e6f0")
                .accent("#a67ba7")
                .text("#402840")
                .avatarExpression("😰")
                .avatarAnimation("pulse")
                .build());

        // HOPELESS: Very soft with warm tones for grounding
        THEMES.put(EmotionalState.HOPELESS, ThemeData.builder()
                .bg("#faf0f0")
                .accent("#8b6b6b")
                .text("#3d2a2a")
                .avatarExpression("😢")
                .avatarAnimation("slow_breathing")
                .build());

        // NEUTRAL: Balanced, light grey
        THEMES.put(EmotionalState.NEUTRAL, ThemeData.builder()
                .bg("#f9f9f9")
                .accent("#7b9fa3")
                .text("#333333")
                .avatarExpression("🙂")
                .avatarAnimation("steady")
                .build());

        // CRITICAL (Crisis): Alert state with warm orange-red
        THEMES.put(EmotionalState.CRITICAL, ThemeData.builder()
                .bg("#fff3e0")
                .accent("#ff6f3c")
                .text("#5d4037")
                .avatarExpression("🤝")
                .avatarAnimation("attentive")
                .build());
    }

    public static ThemeData getTheme(EmotionalState emotion) {
        return THEMES.getOrDefault(emotion, THEMES.get(EmotionalState.NEUTRAL));
    }

    /**
     * Inner class representing theme data for a specific emotion.
     */
    public static class ThemeData {
        private String bg;
        private String accent;
        private String text;
        private String avatarExpression;
        private String avatarAnimation;

        public ThemeData(String bg, String accent, String text, String avatarExpression, String avatarAnimation) {
            this.bg = bg;
            this.accent = accent;
            this.text = text;
            this.avatarExpression = avatarExpression;
            this.avatarAnimation = avatarAnimation;
        }

        public static ThemeDataBuilder builder() {
            return new ThemeDataBuilder();
        }

        public Map<String, String> getThemeMap() {
            Map<String, String> map = new HashMap<>();
            map.put("backgroundColor", bg);
            map.put("accentColor", accent);
            map.put("textColor", text);
            return map;
        }

        public Map<String, String> getAvatarMap() {
            Map<String, String> map = new HashMap<>();
            map.put("expression", avatarExpression);
            map.put("animation", avatarAnimation);
            return map;
        }

        public static class ThemeDataBuilder {
            private String bg;
            private String accent;
            private String text;
            private String avatarExpression;
            private String avatarAnimation;

            public ThemeDataBuilder bg(String bg) {
                this.bg = bg;
                return this;
            }

            public ThemeDataBuilder accent(String accent) {
                this.accent = accent;
                return this;
            }

            public ThemeDataBuilder text(String text) {
                this.text = text;
                return this;
            }

            public ThemeDataBuilder avatarExpression(String avatarExpression) {
                this.avatarExpression = avatarExpression;
                return this;
            }

            public ThemeDataBuilder avatarAnimation(String avatarAnimation) {
                this.avatarAnimation = avatarAnimation;
                return this;
            }

            public ThemeData build() {
                return new ThemeData(bg, accent, text, avatarExpression, avatarAnimation);
            }
        }
    }
}
