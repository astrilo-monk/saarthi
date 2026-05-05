package com.saarthi.chatbot.safety;

import com.saarthi.chatbot.model.EmotionAnalysis;
import com.saarthi.chatbot.model.EmotionalState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Emotion Detection Service
 *
 * Analyzes user messages to detect emotional state (SAD, ANXIOUS, HOPELESS, NEUTRAL).
 * This is NOT for crisis detection - see CrisisDetectorService for that.
 *
 * Uses keyword matching with confidence scoring.
 * Confidence is based on:
 * - Number of emotional keywords found
 * - Keyword weights
 * - Sentiment intensity
 */
@Slf4j
@Service
public class EmotionDetectorService {

    // Keyword patterns for different emotional states
    // Weights are used to score intensity

    private static final Map<String, Double> SAD_KEYWORDS = new HashMap<>();
    private static final Map<String, Double> ANXIOUS_KEYWORDS = new HashMap<>();
    private static final Map<String, Double> HOPELESS_KEYWORDS = new HashMap<>();

    static {
        // SAD emotion keywords
        SAD_KEYWORDS.put("sad", 0.9);
        SAD_KEYWORDS.put("depressed", 1.0);
        SAD_KEYWORDS.put("depression", 1.0);
        SAD_KEYWORDS.put("down", 0.7);
        SAD_KEYWORDS.put("low", 0.7);
        SAD_KEYWORDS.put("miserable", 0.95);
        SAD_KEYWORDS.put("unhappy", 0.85);
        SAD_KEYWORDS.put("upset", 0.7);
        SAD_KEYWORDS.put("crying", 0.9);
        SAD_KEYWORDS.put("tears", 0.85);
        SAD_KEYWORDS.put("lonely", 0.85);
        SAD_KEYWORDS.put("alone", 0.7);
        SAD_KEYWORDS.put("empty", 0.8);
        SAD_KEYWORDS.put("numb", 0.75);
        SAD_KEYWORDS.put("discouraged", 0.8);
        SAD_KEYWORDS.put("disappointed", 0.7);
        SAD_KEYWORDS.put("withdrawn", 0.8);

        // ANXIOUS emotion keywords
        ANXIOUS_KEYWORDS.put("anxious", 1.0);
        ANXIOUS_KEYWORDS.put("anxiety", 1.0);
        ANXIOUS_KEYWORDS.put("worried", 0.9);
        ANXIOUS_KEYWORDS.put("worry", 0.85);
        ANXIOUS_KEYWORDS.put("stressed", 0.85);
        ANXIOUS_KEYWORDS.put("stress", 0.8);
        ANXIOUS_KEYWORDS.put("nervous", 0.8);
        ANXIOUS_KEYWORDS.put("panic", 0.95);
        ANXIOUS_KEYWORDS.put("panicking", 0.95);
        ANXIOUS_KEYWORDS.put("scared", 0.85);
        ANXIOUS_KEYWORDS.put("afraid", 0.85);
        ANXIOUS_KEYWORDS.put("fear", 0.85);
        ANXIOUS_KEYWORDS.put("fearful", 0.85);
        ANXIOUS_KEYWORDS.put("tension", 0.75);
        ANXIOUS_KEYWORDS.put("tense", 0.75);
        ANXIOUS_KEYWORDS.put("overwhelmed", 0.9);
        ANXIOUS_KEYWORDS.put("racing thoughts", 0.85);

        // HOPELESS emotion keywords
        HOPELESS_KEYWORDS.put("hopeless", 1.0);
        HOPELESS_KEYWORDS.put("hopelessness", 1.0);
        HOPELESS_KEYWORDS.put("pointless", 0.95);
        HOPELESS_KEYWORDS.put("worthless", 0.95);
        HOPELESS_KEYWORDS.put("worthlessness", 0.95);
        HOPELESS_KEYWORDS.put("meaningless", 0.9);
        HOPELESS_KEYWORDS.put("futile", 0.9);
        HOPELESS_KEYWORDS.put("give up", 0.85);
        HOPELESS_KEYWORDS.put("no point", 0.85);
        HOPELESS_KEYWORDS.put("can't do anything", 0.8);
        HOPELESS_KEYWORDS.put("terrible", 0.7);
        HOPELESS_KEYWORDS.put("awful", 0.7);
        HOPELESS_KEYWORDS.put("stuck", 0.75);
        HOPELESS_KEYWORDS.put("trapped", 0.8);
        HOPELESS_KEYWORDS.put("doomed", 0.9);
        HOPELESS_KEYWORDS.put("failure", 0.8);
    }

    /**
     * Detects emotional state from a user message.
     * Returns the most likely emotion and a confidence score.
     *
     * @param message The user's message to analyze
     * @return EmotionAnalysis with detected emotion and confidence (0-1)
     */
    public EmotionAnalysis detectEmotion(String message) {
        if (message == null || message.trim().isEmpty()) {
            return EmotionAnalysis.builder()
                    .emotion(EmotionalState.NEUTRAL)
                    .confidence(0.0)
                    .reasoning("Empty message")
                    .build();
        }

        String lowerMessage = message.toLowerCase();

        // Score each emotional category
        double sadScore = calculateEmotionScore(lowerMessage, SAD_KEYWORDS);
        double anxiousScore = calculateEmotionScore(lowerMessage, ANXIOUS_KEYWORDS);
        double hopelessScore = calculateEmotionScore(lowerMessage, HOPELESS_KEYWORDS);

        // Determine dominant emotion
        EmotionalState emotion;
        double maxScore;
        String reasoning;

        if (hopelessScore >= sadScore && hopelessScore >= anxiousScore && hopelessScore > 0) {
            emotion = EmotionalState.HOPELESS;
            maxScore = hopelessScore;
            reasoning = "Detected hopelessness indicators";
        } else if (anxiousScore >= sadScore && anxiousScore > 0) {
            emotion = EmotionalState.ANXIOUS;
            maxScore = anxiousScore;
            reasoning = "Detected anxiety indicators";
        } else if (sadScore > 0) {
            emotion = EmotionalState.SAD;
            maxScore = sadScore;
            reasoning = "Detected sadness indicators";
        } else {
            emotion = EmotionalState.NEUTRAL;
            maxScore = 0.0;
            reasoning = "No strong emotional indicators";
        }

        // Normalize score to 0-1 range
        // Scale based on maximum possible score (for a rough calibration)
        double normalizedScore = Math.min(maxScore / 3.0, 1.0);

        // Only return the emotion if confidence is above threshold
        if (normalizedScore < 0.4) {
            emotion = EmotionalState.NEUTRAL;
            normalizedScore = 0.0;
        }

        log.debug("Emotion detected: {} with confidence {}", emotion, normalizedScore);

        return EmotionAnalysis.builder()
                .emotion(emotion)
                .confidence(normalizedScore)
                .reasoning(reasoning)
                .build();
    }

    /**
     * Calculates an emotion score based on keyword matches.
     * Sums the weights of all matching keywords.
     *
     * @param message The message to analyze (should be lowercase)
     * @param keywords The keywords to search for with their weights
     * @return The total score for this emotion
     */
    private double calculateEmotionScore(String message, Map<String, Double> keywords) {
        double score = 0.0;

        for (Map.Entry<String, Double> entry : keywords.entrySet()) {
            String keyword = entry.getKey();
            double weight = entry.getValue();

            // Count occurrences of the keyword
            int count = countOccurrences(message, keyword);
            score += count * weight;
        }

        return score;
    }

    /**
     * Counts word occurrences in a message (word boundary aware).
     *
     * @param message The message to search in
     * @param keyword The keyword to search for
     * @return Number of occurrences
     */
    private int countOccurrences(String message, String keyword) {
        // Simple word boundary check
        Pattern pattern = Pattern.compile("\\b" + Pattern.quote(keyword) + "\\b");
        long count = pattern.matcher(message).results().count();
        return (int) Math.min(count, 3);  // Cap at 3 to prevent one keyword from dominating
    }
}
