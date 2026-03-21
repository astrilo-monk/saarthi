package com.saarthi.chatbot.safety;

import com.saarthi.chatbot.model.CrisisAnalysis;
import com.saarthi.chatbot.model.EmotionalState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

/**
 * CRITICAL SERVICE: Crisis Detection
 *
 * This service detects self-harm, suicidal ideation, and other crisis situations.
 * MUST be called BEFORE any LLM interaction.
 * If a crisis is detected, LLM should NEVER be called.
 *
 * Safety Rules:
 * 1. Catches variations of common crisis phrases
 * 2. Uses case-insensitive matching
 * 3. Logs every detection immediately
 * 4. Always provides helpline information
 * 5. Cannot be disabled or bypassed
 */
@Slf4j
@Service
public class CrisisDetectorService {

    // Crisis phrase patterns - carefully chosen and tested
    // These patterns catch common expressions of self-harm and suicide
    private static final Pattern SELF_HARM_PATTERN = Pattern.compile(
            "\\b(kill\\s+myself|want\\s+to\\s+die|wanna\\s+die|" +
            "wanna\\s+kill\\s+myself|want\\s+die|end\\s+my\\s+life|" +
            "end\\s+it|slit\\s+my|cut\\s+myself|cut\\s+my\\s+wrist|" +
            "od\\s+on|overdose|jump\\s+off|hang\\s+myself|" +
            "end\\s+everything|kms|kmt|ctb|i\\s+don't\\s+want\\s+to\\s+live|" +
            "no\\s+point\\s+living|better\\s+off\\s+dead|" +
            "should\\s+be\\s+dead|deserve\\s+to\\s+die|not\\s+worth\\s+living)\\b",
            Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    // Secondary pattern for detection of severe hopelessness that may indicate crisis
    private static final Pattern SEVERE_HOPELESSNESS_PATTERN = Pattern.compile(
            "\\b(can't\\s+go\\s+on|can't\\s+take\\s+it|can't\\s+do\\s+this|" +
            "unbearable\\s+pain|can't\\s+cope|give\\s+up|give\\s+up\\s+on\\s+life|" +
            "hopeless|everything\\s+is\\s+hopeless|worthless|" +
            "nobody\\s+cares|nobody\\s+would\\s+miss|burden)\\b",
            Pattern.CASE_INSENSITIVE);

    /** Indian Helplines - CRITICAL INFORMATION */
    private static final String AASRA_HELPLINE = "AASRA: +91-9820466726";
    private static final String iCall_HELPLINE = "iCall: +91-9152987821";
    private static final String VANDREVALA_HELPLINE = "Vandrevala Foundation: +91-9999 666 555";

    private static final String CRISIS_RESPONSE = "I'm genuinely concerned about what you're sharing. " +
            "Please reach out for immediate support from professionals who can truly help:\n\n" +
            AASRA_HELPLINE + "\n" +
            iCall_HELPLINE + "\n" +
            VANDREVALA_HELPLINE + "\n\n" +
            "You don't have to face this alone. These counselors are trained, compassionate, and available right now.";

    /**
     * Analyzes a message for crisis indicators.
     *
     * @param message The user's message to analyze
     * @return CrisisAnalysis containing detection results
     */
    public CrisisAnalysis detectCrisis(String message) {
        if (message == null || message.trim().isEmpty()) {
            return CrisisAnalysis.builder()
                    .isCrisis(false)
                    .severity(0.0)
                    .build();
        }

        String trimmedMessage = message.trim();

        // Check for direct self-harm patterns (highest severity)
        try {
            if (SELF_HARM_PATTERN.matcher(trimmedMessage).find()) {
                log.error("CRISIS DETECTED - Self-harm/suicide phrase detected in message: [REDACTED]");

                return CrisisAnalysis.builder()
                        .isCrisis(true)
                        .detectedPhrase("[Self-harm/suicide ideation]")
                        .severity(1.0)  // Maximum severity
                        .helplineRecommendation(CRISIS_RESPONSE)
                        .build();
            }
        } catch (PatternSyntaxException e) {
            log.error("Error in self-harm pattern regex", e);
        }

        // Check for severe hopelessness patterns (medium severity - needs follow-up)
        try {
            if (SEVERE_HOPELESSNESS_PATTERN.matcher(trimmedMessage).find()) {
                log.warn("CRISIS WARNING - Severe hopelessness indicators detected in message");

                return CrisisAnalysis.builder()
                        .isCrisis(true)
                        .detectedPhrase("[Severe hopelessness]")
                        .severity(0.8)
                        .helplineRecommendation(CRISIS_RESPONSE)
                        .build();
            }
        } catch (PatternSyntaxException e) {
            log.error("Error in hopelessness pattern regex", e);
        }

        // No crisis detected
        return CrisisAnalysis.builder()
                .isCrisis(false)
                .severity(0.0)
                .build();
    }

    /**
     * Gets the helpline response for crisis situations.
     * This is ALWAYS returned on crisis detection, bypassing the LLM.
     *
     * @return The safety response with helpline information
     */
    public String getCrisisResponse() {
        return CRISIS_RESPONSE;
    }

    /**
     * Gets the emotion state for crisis situations.
     * Used to set theme and avatar to alert state.
     *
     * @return EmotionalState.CRITICAL
     */
    public EmotionalState getCrisisEmotionalState() {
        return EmotionalState.CRITICAL;
    }
}
