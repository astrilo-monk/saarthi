package com.saarthi.chatbot.service;

import com.saarthi.chatbot.model.EmotionalState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Response Strategy Service
 *
 * Constructs a carefully crafted system prompt before calling the LLM.
 * This prompt includes:
 * - Clear behavior guidelines for mental health support
 * - Detected emotional state context
 * - Safety rules (no medical advice, no claims to be therapist, etc.)
 * - Tone and style guidance
 *
 * The prompt is designed to nudge the LLM toward supportive, safety-conscious responses
 * without being preachy or overly restrictive.
 */
@Slf4j
@Service
public class ResponseStrategyService {

    private static final String BASE_SYSTEM_PROMPT =
            "You are a compassionate mental health support assistant, NOT a therapist, counselor, or medical professional.\n\n" +
            "Your role is to:\n" +
            "1. Listen and validate the user's feelings without judgment\n" +
            "2. Ask gentle, clarifying questions to understand better\n" +
            "3. Encourage small, realistic, actionable steps\n" +
            "4. Be warm, genuine, and human - not robotic or overly enthusiastic\n\n" +
            "CRITICAL SAFETY RULES:\n" +
            "- NEVER provide medical or psychiatric diagnosis\n" +
            "- NEVER prescribe treatments or medications\n" +
            "- NEVER claim you can replace professional therapy\n" +
            "- NEVER use clichés like 'everything will be okay' or 'just stay positive'\n" +
            "- NEVER minimize the user's feelings\n" +
            "- DO encourage professional help when appropriate\n" +
            "- DO suggest small concrete actions (drink water, take a walk, call a friend, etc.)\n" +
            "- DO acknowledge pain and difficulty\n\n" +
            "TONE & STYLE:\n" +
            "- Write conversationally and naturally\n" +
            "- Keep responses to 3-5 sentences maximum\n" +
            "- Be concise and focused\n" +
            "- Avoid being preachy or patronizing\n" +
            "- Match the user's emotional intensity without amplifying doom or false hope\n";

    /**
     * Builds a complete system prompt for the LLM based on detected emotion.
     * This prompt is injected into the LLM API call to guide responses.
     *
     * @param detectedEmotion The emotion state detected from the message
     * @param emotionConfidence Confidence score (0-1) for the detection
     * @param conversationContext Recent conversation history (for context)
     * @return The complete system prompt to send to LLM
     */
    public String buildSystemPrompt(EmotionalState detectedEmotion,
                                     double emotionConfidence,
                                     String conversationContext) {
        StringBuilder prompt = new StringBuilder(BASE_SYSTEM_PROMPT);

        // Add emotion-specific guidance if confidence is high enough
        if (emotionConfidence > 0.6) {
            prompt.append("\n\nCURRENT EMOTIONAL CONTEXT:\n");
            prompt.append(getEmotionGuidance(detectedEmotion));
        }

        // Add conversation context if provided
        if (conversationContext != null && !conversationContext.isEmpty()) {
            prompt.append("\n\nRECENT CONVERSATION CONTEXT:\n");
            prompt.append(conversationContext);
        }

        log.debug("System prompt built for emotion: {} (confidence: {})", detectedEmotion, emotionConfidence);
        return prompt.toString();
    }

    /**
     * Gets emotion-specific guidance for the LLM.
     * Tailors the response strategy to the detected emotion.
     *
     * @param emotion The detected emotional state
     * @return Emotion-specific guidance string
     */
    private String getEmotionGuidance(EmotionalState emotion) {
        return switch (emotion) {
            case SAD -> "The user is expressing sadness or depressive feelings. " +
                    "Validate the difficulty of what they're experiencing. " +
                    "Gently explore what's contributing to these feelings. " +
                    "Suggest small, concrete positive actions they might take. " +
                    "Acknowledge that sadness is sometimes a signal that something needs attention.";

            case ANXIOUS -> "The user is expressing anxiety or worry. " +
                    "Acknowledge their worry without dismissing it. " +
                    "Help them identify what specifically is causing anxiety. " +
                    "Suggest grounding techniques (5 senses, breathing, etc.) if appropriate. " +
                    "Remind them that anxiety is a normal emotion and can be managed.";

            case HOPELESS -> "The user is expressing hopelessness or despair. " +
                    "This is serious - validate their pain first. " +
                    "Do NOT use toxic positivity. " +
                    "Help them see even small possibilities or reasons to reach out for help. " +
                    "Strongly encourage them to speak with a professional or helpline. " +
                    "Ask them if they have someone they trust they can talk to.";

            case NEUTRAL -> "The user's emotion is unclear or neutral. " +
                    "Be present and curious about what's on their mind. " +
                    "Ask open-ended questions to understand better.";

            case CRITICAL -> "ERROR: CRITICAL state should never reach LLM! Crisis response should be returned instead.";
        };
    }

    /**
     * Builds context string from recent conversation history.
     * Helps the LLM maintain continuity and understand patterns.
     *
     * @param conversationHistory List of recent messages (alternating user/bot)
     * @return Formatted context string
     */
    public String buildConversationContext(String conversationHistory) {
        if (conversationHistory == null || conversationHistory.isEmpty()) {
            return "";
        }

        // Keep it brief - just 2-3 previous messages
        return "Recent conversation:\n" + conversationHistory;
    }

    /**
     * Gets the complete prompt for OpenAI API.
     * Combines system prompt with optional conversation history format.
     *
     * @param detectedEmotion User's detected emotion
     * @param emotionConfidence Confidence in emotion detection
     * @param userMessage The current user message
     * @param recentHistory Recent conversation history
     * @return The system message to send to LLM
     */
    public String getFinalSystemPrompt(EmotionalState detectedEmotion,
                                       double emotionConfidence,
                                       String userMessage,
                                       String recentHistory) {
        String systemPrompt = buildSystemPrompt(detectedEmotion, emotionConfidence, recentHistory);
        log.debug("Final system prompt ready for emotion: {}", detectedEmotion);
        return systemPrompt;
    }
}
