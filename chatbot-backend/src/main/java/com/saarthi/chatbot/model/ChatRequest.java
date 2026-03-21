package com.saarthi.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for chat endpoint.
 * Contains the user's message and optional session ID.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;      // User's message
    private String sessionId;    // Optional session ID for conversation history
}
