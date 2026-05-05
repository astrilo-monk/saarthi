package com.saarthi.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Saarthi Mental Health Chatbot Backend
 *
 * Spring Boot application entry point for the AI-powered mental health support chatbot.
 * Includes safety features for supporting vulnerable users experiencing depression, anxiety, etc.
 *
 * To run:
 * mvn spring-boot:run
 * Or with API key:
 * OPENAI_API_KEY=sk-xxxxx mvn spring-boot:run
 *
 * Server runs on http://localhost:8080
 * API endpoints available at http://localhost:8080/api
 */
@SpringBootApplication
@EnableScheduling
public class ChatbotApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatbotApplication.class, args);
    }
}
