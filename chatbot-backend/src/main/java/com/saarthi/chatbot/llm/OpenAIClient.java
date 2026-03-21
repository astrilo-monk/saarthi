package com.saarthi.chatbot.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * OpenAI API Client Service
 *
 * Handles communication with OpenAI API for generating supportive responses.
 * Uses gpt-3.5-turbo model with safety guardrails.
 *
 * Requires OPENAI_API_KEY environment variable to be set.
 */
@Slf4j
@Service
public class OpenAIClient {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${openai.temperature:0.7}")
    private double temperature;

    @Value("${openai.max-tokens:150}")
    private int maxTokens;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final int MAX_RETRIES = 2;
    private static final long RETRY_DELAY_MS = 1000;

    /**
     * Calls OpenAI API with given system prompt and user message.
     * Implements retry logic for transient failures.
     *
     * @param systemPrompt System prompt guiding LLM behavior
     * @param userMessage The user's message to respond to
     * @return The LLM-generated response text
     * @throws RuntimeException if API call fails after retries
     */
    public String generateResponse(String systemPrompt, String userMessage) {
        // Check if API key is configured
        if (apiKey == null || apiKey.isEmpty()) {
            log.error("OPENAI_API_KEY environment variable is not set!");
            return getFallbackResponse();
        }

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                log.debug("Calling OpenAI API (attempt {}/{})", attempt, MAX_RETRIES);

                String response = callOpenAIAPI(systemPrompt, userMessage);

                if (response != null && !response.isEmpty()) {
                    log.info("Successfully received response from OpenAI (model: {})", model);
                    return validateAndSanitizeResponse(response);
                }

            } catch (Exception e) {
                log.warn("OpenAI API call failed (attempt {}/{}): {}", attempt, MAX_RETRIES, e.getMessage());

                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);  // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.error("OpenAI API failed after {} retries: {}", MAX_RETRIES, e.getMessage());
                    return getFallbackResponse();
                }
            }
        }

        return getFallbackResponse();
    }

    /**
     * Makes the actual HTTP request to OpenAI API.
     *
     * @param systemPrompt System prompt for LLM
     * @param userMessage User's message
     * @return Response text from LLM
     */
    private String callOpenAIAPI(String systemPrompt, String userMessage) throws Exception {
        // Build request body for OpenAI
        Map<String, Object> requestBody = buildOpenAIRequestBody(systemPrompt, userMessage);
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        log.debug("Sending request to OpenAI API");

        // Build HTTP request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(OPENAI_API_URL))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        // Send request
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");

            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> choice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) choice.get("message");

                if (message != null) {
                    String content = (String) message.get("content");
                    if (content != null) {
                        return content;
                    }
                }
            }
        } else {
            String errorBody = response.body();
            log.error("OpenAI API returned status {}: {}", response.statusCode(), errorBody);

            // Check for specific error messages
            if (response.statusCode() == 401) {
                log.error("Invalid API key! Check your OPENAI_API_KEY environment variable.");
            } else if (response.statusCode() == 429) {
                log.error("Rate limit exceeded. Try again in a moment.");
            }

            throw new RuntimeException("OpenAI API error: " + response.statusCode());
        }

        return null;
    }

    /**
     * Builds the request body for OpenAI API.
     *
     * @param systemPrompt System prompt
     * @param userMessage User message
     * @return Request body as a Map
     */
    private Map<String, Object> buildOpenAIRequestBody(String systemPrompt, String userMessage) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("temperature", temperature);
        body.put("max_tokens", maxTokens);

        List<Map<String, String>> messages = new ArrayList<>();

        // System message with our guidelines
        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        messages.add(systemMsg);

        // User message
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        body.put("messages", messages);
        return body;
    }

    /**
     * Validates and sanitizes the response from the LLM.
     * Checks for inappropriate content or harmful advice.
     *
     * @param response The LLM response text
     * @return Sanitized response
     */
    private String validateAndSanitizeResponse(String response) {
        // Basic validation - check for obviously harmful patterns
        String lowerResponse = response.toLowerCase();

        // Check for medical advice indicators (should be rare with good prompting)
        if (lowerResponse.contains("prescription") && lowerResponse.contains("medication")) {
            log.warn("Response contained medical advice, filtering");
            return "I'm not qualified to give medical advice, but I'm here to listen. " +
                    "A healthcare professional would be the best person to discuss treatment options with.";
        }

        // Check for therapist claims
        if (lowerResponse.contains("i'm a therapist") || lowerResponse.contains("i am a therapist")) {
            log.warn("Response claimed to be therapist, filtering");
            return response.replaceAll("(?i)i'?m a therapist", "I'm here to listen and support");
        }

        // Trim response if it's too long (shouldn't happen but safety check)
        if (response.length() > 500) {
            log.warn("Response was too long ({}), trimming", response.length());
            response = response.substring(0, 497) + "...";
        }

        return response.trim();
    }

    /**
     * Fallback response when API is unavailable.
     * Better than no response, maintains safety guardrails.
     *
     * @return A compassionate fallback response
     */
    private String getFallbackResponse() {
        return "I'm experiencing some technical difficulties right now, but I want you to know that " +
                "what you're feeling matters. If you're in crisis, please reach out to a trusted friend, " +
                "family member, or contact a helpline immediately.";
    }

    /**
     * Health check for the OpenAI service.
     * Verifies that API key is configured.
     *
     * @return true if API key is configured
     */
    public boolean isHealthy() {
        return apiKey != null && !apiKey.isEmpty();
    }
}
