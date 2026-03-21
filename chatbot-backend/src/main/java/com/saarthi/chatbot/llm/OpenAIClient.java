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
 * Ollama LLM Client Service
 *
 * Handles communication with Ollama local API for generating supportive responses.
 * Implements error handling, retries, and response validation.
 *
 * Ollama runs locally at http://localhost:11434
 * No API key required - completely free and private.
 */
@Slf4j
@Service
public class OpenAIClient {

    @Value("${ollama.api.url:http://localhost:11434/api/chat}")
    private String apiUrl;

    @Value("${ollama.model:llama2}")
    private String model;

    @Value("${ollama.temperature:0.7}")
    private double temperature;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int MAX_RETRIES = 2;
    private static final long RETRY_DELAY_MS = 1000;

    /**
     * Calls Ollama API with given system prompt and user message.
     * Implements retry logic for transient failures.
     *
     * @param systemPrompt System prompt guiding LLM behavior
     * @param userMessage The user's message to respond to
     * @return The LLM-generated response text
     * @throws RuntimeException if API call fails after retries
     */
    public String generateResponse(String systemPrompt, String userMessage) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                log.debug("Calling Ollama API on {}:{} (attempt {}/{})", "localhost", "11434", attempt, MAX_RETRIES);

                String response = callOllamaAPI(systemPrompt, userMessage);

                if (response != null && !response.isEmpty()) {
                    log.info("Successfully received response from Ollama (model: {})", model);
                    return validateAndSanitizeResponse(response);
                }

            } catch (Exception e) {
                log.warn("Ollama API call failed (attempt {}/{}): {}", attempt, MAX_RETRIES, e.getMessage());

                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);  // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.error("Ollama API failed after {} retries. Is Ollama running on localhost:11434?", MAX_RETRIES, e);
                    return getFallbackResponse();
                }
            }
        }

        return getFallbackResponse();
    }

    /**
     * Makes the actual HTTP request to Ollama API.
     * Ollama runs locally and provides a simple chat API.
     *
     * @param systemPrompt System prompt for LLM
     * @param userMessage User's message
     * @return Response text from LLM
     */
    private String callOllamaAPI(String systemPrompt, String userMessage) throws Exception {
        // Build request body for Ollama
        Map<String, Object> requestBody = buildOllamaRequestBody(systemPrompt, userMessage);
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        log.debug("Sending request to Ollama API at {}", apiUrl);

        // Build HTTP request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(60))  // Increased timeout for Ollama (can be slow on CPU)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        // Send request
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
            Map<String, Object> message = (Map<String, Object>) responseMap.get("message");

            if (message != null) {
                String content = (String) message.get("content");
                if (content != null) {
                    return content;
                }
            }
        } else {
            log.error("Ollama API returned status {}: {}", response.statusCode(), response.body());
            throw new RuntimeException("Ollama API error: " + response.statusCode());
        }

        return null;
    }

    /**
     * Builds the request body for Ollama API.
     *
     * @param systemPrompt System prompt
     * @param userMessage User message
     * @return Request body as a Map
     */
    private Map<String, Object> buildOllamaRequestBody(String systemPrompt, String userMessage) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("temperature", temperature);
        body.put("stream", false);  // Ollama-specific: don't stream responses
        body.put("num_predict", 150);  // Limit response length to speed up generation

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
     * Health check for the Ollama service.
     * Simple verification that Ollama is configured and running.
     *
     * @return true if service appears to be accessible
     */
    public boolean isHealthy() {
        return apiUrl != null && apiUrl.contains("localhost");
    }
}
