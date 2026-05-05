package com.saarthi.chatbot.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for chat endpoint.
 * Contains the AI response, detected emotion, and theming information for the frontend.
 * This is the complete API response that includes everything needed for emotional UI rendering.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatResponse {
    private String id;                              // Unique message ID
    private String userMessage;                     // Echo of user's input
    private String aiResponse;                      // AI-generated response

    // Emotion and Crisis Information
    private String detectedEmotion;                 // SAD, ANXIOUS, HOPELESS, NEUTRAL, CRITICAL
    private double emotionConfidence;               // 0.0 to 1.0
    private boolean isCrisis;                       // Is this a crisis situation?

    // Theme Information for Frontend (emotion-aware colors)
    private Map<String, String> theme;              // { bg, accent, text }

    // Avatar Information for Frontend
    private Map<String, String> avatar;             // { expression, animation }

    // Metadata
    private LocalDateTime timestamp;
    private String sessionId;                       // For conversation history
}
