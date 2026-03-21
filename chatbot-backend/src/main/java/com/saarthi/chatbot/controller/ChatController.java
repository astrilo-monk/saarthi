package com.saarthi.chatbot.controller;

import com.saarthi.chatbot.model.ChatRequest;
import com.saarthi.chatbot.model.ChatResponse;
import com.saarthi.chatbot.service.ChatService;
import com.saarthi.chatbot.llm.OpenAIClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Chat Controller
 *
 * REST API endpoints for the chatbot.
 * Exposes the chat interface for the frontend (React/Astro).
 *
 * Endpoints:
 * POST /chat/message - Send message and get response
 * GET /health - Health check
 */
@Slf4j
@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = {"http://localhost:4321", "http://localhost:5173", "http://localhost:3000"})
public class ChatController {

    private final ChatService chatService;
    private final OpenAIClient openaiClient;

    public ChatController(ChatService chatService, OpenAIClient openaiClient) {
        this.chatService = chatService;
        this.openaiClient = openaiClient;
    }

    /**
     * Main chat endpoint.
     * Accepts a user message and returns AI response with emotion metadata.
     *
     * @param request ChatRequest containing message and optional sessionId
     * @return ChatResponse with AI response, emotion, theme, and avatar data
     */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("Received chat request");

        try {
            // Process the chat through the safety pipeline
            ChatResponse response = chatService.processChat(request);

            log.debug("Chat processed successfully. Crisis: {}, Emotion: {}",
                    response.isCrisis(), response.getDetectedEmotion());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error processing chat message", e);

            // Return error response
            ChatResponse errorResponse = ChatResponse.builder()
                    .id("error-" + System.currentTimeMillis())
                    .aiResponse("I encountered an error processing your message. Please try again.")
                    .detectedEmotion("NEUTRAL")
                    .emotionConfidence(0.0)
                    .isCrisis(false)
                    .build();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Health check endpoint.
     * Returns service status and LLM connectivity.
     *
     * @return Health status JSON
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.debug("Health check requested");

        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "saarthi-chatbot");
        health.put("llmConnected", openaiClient.isHealthy());
        health.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(health);
    }

    /**
     * Root endpoint for API documentation.
     *
     * @return API info
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("service", "Saarthi Mental Health Chatbot API");
        info.put("version", "1.0.0");
        info.put("endpoints", new HashMap<String, String>() {{
            put("POST /chat/message", "Send message and get response");
            put("GET /health", "Health check");
        }});

        return ResponseEntity.ok(info);
    }
}
