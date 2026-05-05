package com.saarthi.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the result of crisis detection.
 * Used to identify self-harm, suicide ideation, or other safety-critical situations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrisisAnalysis {
    private boolean isCrisis;  // Is this a crisis situation?
    private String detectedPhrase;  // What crisis phrase was detected?
    private double severity;  // 0.0 to 1.0 - how severe is the situation?
    private String helplineRecommendation;  // Which helpline to contact
}
