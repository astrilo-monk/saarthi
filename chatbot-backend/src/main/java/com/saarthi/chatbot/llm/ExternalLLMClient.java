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
 * External LLM API Client Service
 *
 * Uses OpenAI-compatible API format so it works with free providers like Groq.
 * Recommended for free-tier deployments: 
 * Provider: Groq (https://console.groq.com)
 * Base URL: https://api.groq.com/openai/v1/chat/completions
 * Model: llama3-8b-8192
 */
@Slf4j
@Service
public class ExternalLLMClient {

    @Value("${llm.api.key:}")
    private String apiKey;

    @Value("${llm.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${llm.model:llama3-8b-8192}")
    private String model;

    @Value("${llm.temperature:0.7}")
    private double temperature;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateResponse(String systemPrompt, String userMessage) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.error("LLM API key is missing! Set the LLM_API_KEY environment variable.");
            return getFallbackResponse();
        }

        try {
            Map<String, Object> requestBody = buildRequestBody(systemPrompt, userMessage);
            String jsonBody = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .timeout(Duration.ofSeconds(60))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            } else {
                log.error("LLM API returned status {}: {}", response.statusCode(), response.body());
                return getFallbackResponse();
            }

        } catch (Exception e) {
            log.error("Error calling LLM API: {}", e.getMessage());
        }

        return getFallbackResponse();
    }

    private Map<String, Object> buildRequestBody(String systemPrompt, String userMessage) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("temperature", temperature);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userMessage));
        
        body.put("messages", messages);
        return body;
    }

    private String getFallbackResponse() {
        return "I'm experiencing some technical difficulties right now, but I want you to know that " +
                "what you're feeling matters. If you're in crisis, please reach out to a trusted friend, " +
                "family member, or contact a helpline immediately.";
    }

    public boolean isHealthy() {
        return apiKey != null && !apiKey.isEmpty();
    }
}
