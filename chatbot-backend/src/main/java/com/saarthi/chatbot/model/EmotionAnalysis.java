package com.saarthi.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the result of emotion detection analysis.
 * Contains the detected emotion and confidence score (0-1).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmotionAnalysis {
    private EmotionalState emotion;
    private double confidence;  // 0.0 to 1.0
    private String reasoning;   // Why this emotion was detected
}
