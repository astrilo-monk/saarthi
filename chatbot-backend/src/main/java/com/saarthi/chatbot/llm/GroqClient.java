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
import java.util.*;

/**
 * Groq Client Service
 *
 * Handles communication with Groq's OpenAI-compatible API for generating supportive responses.
 * Groq provides ultra-fast inference via their LPU hardware.
 *
 * Requires a GROQ_API_KEY environment variable or groq.api-key property.
 * Free tier: https://console.groq.com
 */
@Slf4j
@Service
public class GroqClient {

    @Value("${groq.api-key:}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    @Value("${groq.temperature:0.7}")
    private double temperature;

    @Value("${groq.top-p:0.9}")
    private double topP;

    @Value("${groq.max-tokens:512}")
    private int maxTokens;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int MAX_RETRIES = 2;
    private static final long RETRY_DELAY_MS = 1000;

    /**
     * Calls Groq API with given system prompt and user message.
     * Implements retry logic for transient failures.
     *
     * @param systemPrompt System prompt guiding LLM behavior
     * @param userMessage The user's message to respond to
     * @return The LLM-generated response text
     */
    public String generateResponse(String systemPrompt, String userMessage) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.error("GROQ_API_KEY is not set! Configure groq.api-key in application.properties or set GROQ_API_KEY env var.");
            return getFallbackResponse();
        }

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                log.debug("Calling Groq API (attempt {}/{})", attempt, MAX_RETRIES);

                String response = callGroqAPI(systemPrompt, userMessage);

                if (response != null && !response.isEmpty()) {
                    log.info("Successfully received response from Groq (model: {})", model);
                    return validateAndSanitizeResponse(response);
                }

            } catch (Exception e) {
                log.warn("Groq API call failed (attempt {}/{}): {}", attempt, MAX_RETRIES, e.getMessage());
                log.debug("Full error stack:", e);

                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);  // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.error("Groq API failed after {} retries: {}", MAX_RETRIES, e.getMessage());
                    return getFallbackResponse();
                }
            }
        }

        return getFallbackResponse();
    }

    /**
     * Makes the actual HTTP request to Groq API (OpenAI-compatible format).
     *
     * @param systemPrompt System prompt for LLM
     * @param userMessage User's message
     * @return Response text from LLM
     */
    private String callGroqAPI(String systemPrompt, String userMessage) throws Exception {
        // Build request body in OpenAI chat completions format
        Map<String, Object> requestBody = buildGroqRequestBody(systemPrompt, userMessage);
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        log.debug("Sending request to Groq API");

        // Build HTTP request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GROQ_API_URL))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        // Send request
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return parseGroqResponse(response.body());
        } else {
            String errorBody = response.body();
            log.error("Groq API returned status {}: {}", response.statusCode(), errorBody);
            throw new RuntimeException("Groq API error: " + response.statusCode() + " - " + errorBody);
        }
    }

    /**
     * Parses Groq's OpenAI-compatible response format.
     *
     * @param responseBody The JSON response body from Groq
     * @return The assistant's message content
     */
    @SuppressWarnings("unchecked")
    private String parseGroqResponse(String responseBody) {
        try {
            Map<String, Object> jsonObj = objectMapper.readValue(responseBody, Map.class);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) jsonObj.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> firstChoice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                if (message != null) {
                    String content = (String) message.get("content");
                    if (content != null && !content.isEmpty()) {
                        return content;
                    }
                }
            }

            log.warn("Unexpected Groq response structure: {}", responseBody);
            return null;
        } catch (Exception e) {
            log.warn("Error parsing Groq response: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Builds the request body for Groq API (OpenAI chat completions format).
     *
     * @param systemPrompt System prompt
     * @param userMessage User message
     * @return Request body as a Map
     */
    private Map<String, Object> buildGroqRequestBody(String systemPrompt, String userMessage) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("temperature", temperature);
        body.put("top_p", topP);
        body.put("max_tokens", maxTokens);
        body.put("stream", false);

        // Build messages array (OpenAI chat format)
        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        messages.add(systemMsg);

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

        // Trim response if it's too long (safety check for excessively long responses)
        if (response.length() > 2000) {
            log.warn("Response was too long ({}), trimming", response.length());
            response = response.substring(0, 1997) + "...";
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
     * Health check for the Groq service.
     * Verifies that the API key is configured and the service is reachable.
     *
     * @return true if Groq is configured and accessible
     */
    public boolean isHealthy() {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Groq health check failed: API key not configured");
            return false;
        }

        try {
            // Quick models list call to verify API key works
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.groq.com/openai/v1/models"))
                    .timeout(Duration.ofSeconds(5))
                    .header("Authorization", "Bearer " + apiKey)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            log.warn("Groq health check failed: {}", e.getMessage());
            return false;
        }
    }
}
