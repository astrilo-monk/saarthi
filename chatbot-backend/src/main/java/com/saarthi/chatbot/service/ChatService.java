package com.saarthi.chatbot.service;

import com.saarthi.chatbot.llm.OpenAIClient;
import com.saarthi.chatbot.model.*;
import com.saarthi.chatbot.safety.CrisisDetectorService;
import com.saarthi.chatbot.safety.EmotionDetectorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Main Chat Service
 *
 * Orchestrates the complete chatbot pipeline:
 * 1. Input Validation
 * 2. Crisis Detection (FIRST - safety critical)
 * 3. Emotion Detection
 * 4. Response Strategy Building
 * 5. LLM Call (if not crisis)
 * 6. Response Theme & Avatar Selection
 * 7. Return to Frontend
 *
 * This service implements the safety-first architecture described in the plan.
 */
@Slf4j
@Service
public class ChatService {

    private final CrisisDetectorService crisisDetector;
    private final EmotionDetectorService emotionDetector;
    private final ResponseStrategyService responseStrategy;
    private final OpenAIClient openaiClient;
    private final ConversationService conversationService;

    public ChatService(CrisisDetectorService crisisDetector,
                       EmotionDetectorService emotionDetector,
                       ResponseStrategyService responseStrategy,
                       OpenAIClient openaiClient,
                       ConversationService conversationService) {
        this.crisisDetector = crisisDetector;
        this.emotionDetector = emotionDetector;
        this.responseStrategy = responseStrategy;
        this.openaiClient = openaiClient;
        this.conversationService = conversationService;
    }

    /**
     * Main entry point for chat.
     * Implements the complete safety pipeline.
     *
     * @param request ChatRequest with user message and optional session ID
     * @return ChatResponse with AI response, emotion, theme, and avatar data
     */
    public ChatResponse processChat(ChatRequest request) {
        String userMessage = request.getMessage();
        String sessionId = request.getSessionId() != null ? request.getSessionId() : UUID.randomUUID().toString();

        log.info("Processing chat message for session: {}", sessionId);

        // Validate input
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return buildErrorResponse("Please share what's on your mind.", sessionId);
        }

        userMessage = userMessage.trim();

        // CRITICAL: STEP 1 - Check for crisis FIRST, ALWAYS
        CrisisAnalysis crisisAnalysis = crisisDetector.detectCrisis(userMessage);

        if (crisisAnalysis.isCrisis()) {
            log.error("CRISIS DETECTED - Returning immediate safety response, NO LLM CALL");
            conversationService.addUserMessage(sessionId, userMessage);

            return buildCrisisResponse(sessionId, userMessage);
        }

        // STEP 2 - Detect emotional state
        EmotionAnalysis emotionAnalysis = emotionDetector.detectEmotion(userMessage);
        log.debug("Emotion detected: {} (confidence: {})", emotionAnalysis.getEmotion(), emotionAnalysis.getConfidence());

        // STEP 3 - Get recent conversation context
        String recentContext = conversationService.getRecentContext(sessionId, 4);

        // STEP 4 - Build response strategy  (system prompt with guidelines)
        String systemPrompt = responseStrategy.getFinalSystemPrompt(
                emotionAnalysis.getEmotion(),
                emotionAnalysis.getConfidence(),
                userMessage,
                recentContext
        );

        // Add user message to history BEFORE calling LLM
        conversationService.addUserMessage(sessionId, userMessage);

        // STEP 5 - Call LLM with safety guardrails
        log.debug("Calling LLM with system prompt for emotion: {}", emotionAnalysis.getEmotion());
        String aiResponse = openaiClient.generateResponse(systemPrompt, userMessage);

        // Add AI response to history
        conversationService.addAssistantMessage(sessionId, aiResponse);

        // STEP 6 - Get theme and avatar for detected emotion
        EmotionThemeConfig.ThemeData themeData = EmotionThemeConfig.getTheme(emotionAnalysis.getEmotion());

        // Build the complete response with all frontend data
        ChatResponse response = ChatResponse.builder()
                .id(UUID.randomUUID().toString())
                .userMessage(userMessage)
                .aiResponse(aiResponse)
                .detectedEmotion(emotionAnalysis.getEmotion().toString())
                .emotionConfidence(emotionAnalysis.getConfidence())
                .theme(themeData.getThemeMap())
                .avatar(themeData.getAvatarMap())
                .isCrisis(false)
                .timestamp(LocalDateTime.now())
                .sessionId(sessionId)
                .build();

        log.info("Chat processed successfully. Emotion: {}, Response length: {}",
                emotionAnalysis.getEmotion(), aiResponse.length());

        return response;
    }

    /**
     * Builds a crisis response immediately without LLM involvement.
     * ALWAYS called when crisis is detected.
     *
     * @param sessionId The session ID
     * @param userMessage The user's message
     * @return Crisis response with helpline information
     */
    private ChatResponse buildCrisisResponse(String sessionId, String userMessage) {
        String crisisResponse = crisisDetector.getCrisisResponse();
        EmotionalState crisisEmotion = crisisDetector.getCrisisEmotionalState();
        EmotionThemeConfig.ThemeData themeData = EmotionThemeConfig.getTheme(crisisEmotion);

        return ChatResponse.builder()
                .id(UUID.randomUUID().toString())
                .userMessage(userMessage)
                .aiResponse(crisisResponse)
                .detectedEmotion(crisisEmotion.toString())
                .emotionConfidence(1.0)  // Crisis is 100% certain
                .theme(themeData.getThemeMap())
                .avatar(themeData.getAvatarMap())
                .isCrisis(true)
                .timestamp(LocalDateTime.now())
                .sessionId(sessionId)
                .build();
    }

    /**
     * Builds an error response for invalid input.
     *
     * @param message The error message
     * @param sessionId The session ID
     * @return Error response
     */
    private ChatResponse buildErrorResponse(String message, String sessionId) {
        EmotionThemeConfig.ThemeData themeData = EmotionThemeConfig.getTheme(EmotionalState.NEUTRAL);

        return ChatResponse.builder()
                .id(UUID.randomUUID().toString())
                .userMessage("")
                .aiResponse(message)
                .detectedEmotion(EmotionalState.NEUTRAL.toString())
                .emotionConfidence(0.0)
                .theme(themeData.getThemeMap())
                .avatar(themeData.getAvatarMap())
                .isCrisis(false)
                .timestamp(LocalDateTime.now())
                .sessionId(sessionId)
                .build();
    }
}
