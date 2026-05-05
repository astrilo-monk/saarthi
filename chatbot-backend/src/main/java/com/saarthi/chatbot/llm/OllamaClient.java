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
 * Ollama Client Service
 *
 * Handles communication with Ollama API for generating supportive responses.
 * Ollama runs locally and provides open-source LLM models.
 *
 * Requires Ollama to be running on localhost:11434
 * Default model: mistral (or configure via ollama.model property)
 */
@Slf4j
@Service
public class OllamaClient {

    @Value("${ollama.base-url:http://localhost:11434}")
    private String baseUrl;

    @Value("${ollama.model:neural-chat}")
    private String model;

    @Value("${ollama.temperature:0.7}")
    private double temperature;

    @Value("${ollama.top-p:0.9}")
    private double topP;

    @Value("${ollama.top-k:40}")
    private int topK;

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
                log.debug("Calling Ollama API (attempt {}/{})", attempt, MAX_RETRIES);

                String response = callOllamaAPI(systemPrompt, userMessage);

                if (response != null && !response.isEmpty()) {
                    log.info("Successfully received response from Ollama (model: {})", model);
                    return validateAndSanitizeResponse(response);
                }

            } catch (Exception e) {
                log.warn("Ollama API call failed (attempt {}/{}): {}", attempt, MAX_RETRIES, e.getMessage());
                log.debug("Full error stack:", e);

                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);  // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.error("Ollama API failed after {} retries: {}", MAX_RETRIES, e.getMessage());
                    return getFallbackResponse();
                }
            }
        }

        return getFallbackResponse();
    }

    /**
     * Makes the actual HTTP request to Ollama API.
     *
     * @param systemPrompt System prompt for LLM
     * @param userMessage User's message
     * @return Response text from LLM
     */
    private String callOllamaAPI(String systemPrompt, String userMessage) throws Exception {
        // Build request body for Ollama
        Map<String, Object> requestBody = buildOllamaRequestBody(systemPrompt, userMessage);
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        log.debug("Sending request to Ollama API at {}", baseUrl);

        // Build HTTP request
        String apiUrl = baseUrl + "/api/generate";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(120))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        // Send request
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            String responseBody = response.body();

            // Ollama returns newline-delimited JSON objects
            // We need to parse and combine them
            String combinedResponse = parseOllamaResponse(responseBody);

            if (combinedResponse != null && !combinedResponse.isEmpty()) {
                return combinedResponse;
            }
        } else {
            String errorBody = response.body();
            log.error("Ollama API returned status {}: {}", response.statusCode(), errorBody);
            throw new RuntimeException("Ollama API error: " + response.statusCode());
        }

        return null;
    }

    /**
     * Parses Ollama's streaming response format (newline-delimited JSON).
     * Ollama returns multiple JSON objects separated by newlines.
     *
     * @param responseBody The response body from Ollama
     * @return Combined response text
     */
    private String parseOllamaResponse(String responseBody) {
        StringBuilder combined = new StringBuilder();

        try {
            String[] lines = responseBody.split("\n");

            for (String line : lines) {
                if (line.trim().isEmpty()) {
                    continue;
                }

                Map<String, Object> jsonObj = objectMapper.readValue(line, Map.class);
                String response = (String) jsonObj.get("response");

                if (response != null) {
                    combined.append(response);
                }

                // Check if this is the last chunk
                Object done = jsonObj.get("done");
                if (done != null && (Boolean) done) {
                    break;
                }
            }
        } catch (Exception e) {
            log.warn("Error parsing Ollama response: {}", e.getMessage());
            return null;
        }

        return combined.toString();
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
        body.put("top_p", topP);
        body.put("top_k", topK);
        body.put("stream", false);  // We handle streaming manually if needed
        body.put("num_predict", 512);  // Allow longer responses (up to 512 tokens)

        // Build the prompt with system message and user message
        String prompt = systemPrompt + "\n\nUser: " + userMessage + "\n\nAssistant:";
        body.put("prompt", prompt);

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
     * Health check for the Ollama service.
     * Verifies that Ollama is running and accessible.
     *
     * @return true if Ollama is accessible
     */
    public boolean isHealthy() {
        try {
            String healthUrl = baseUrl + "/api/tags";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(healthUrl))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            log.warn("Ollama health check failed: {}", e.getMessage());
            return false;
        }
    }
}
