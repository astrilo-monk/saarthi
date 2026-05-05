package com.saarthi.chatbot.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Conversation Service
 *
 * Manages conversation history for context in multi-turn conversations.
 * Uses in-memory storage for MVP (can be upgraded to database).
 *
 * Keeps track of recent messages to provide context for the LLM,
 * helping it understand conversation continuity and emotional patterns.
 */
@Slf4j
@Service
public class ConversationService {

    @Value("${chatbot.max-conversation-history:10}")
    private int maxHistorySize;

    @Value("${chatbot.session-timeout-minutes:30}")
    private int sessionTimeoutMinutes;

    // Store conversations by session ID
    // Each conversation is a list of message exchanges
    private final Map<String, ConversationSession> sessions = new ConcurrentHashMap<>();

    /**
     * Inner class representing a single conversation session.
     */
    private static class ConversationSession {
        private final List<Message> messages = new ArrayList<>();
        private long lastActivityTime;

        ConversationSession() {
            this.lastActivityTime = System.currentTimeMillis();
        }

        void addMessage(String role, String content) {
            messages.add(new Message(role, content, System.currentTimeMillis()));
            this.lastActivityTime = System.currentTimeMillis();
        }

        List<Message> getMessages() {
            return new ArrayList<>(messages);
        }

        void updateLastActivity() {
            this.lastActivityTime = System.currentTimeMillis();
        }

        boolean isExpired(int timeoutMinutes) {
            long timeoutMillis = (long) timeoutMinutes * 60 * 1000;
            return System.currentTimeMillis() - lastActivityTime > timeoutMillis;
        }
    }

    /**
     * Inner class representing a single message in the conversation.
     */
    private static class Message {
        String role;  // "user" or "assistant"
        String content;
        long timestamp;

        Message(String role, String content, long timestamp) {
            this.role = role;
            this.content = content;
            this.timestamp = timestamp;
        }
    }

    /**
     * Gets or creates a conversation session for a given ID.
     *
     * @param sessionId The unique session ID
     * @return ConversationSession
     */
    private ConversationSession getOrCreateSession(String sessionId) {
        return sessions.computeIfAbsent(sessionId, k -> new ConversationSession());
    }

    /**
     * Adds a user message to the conversation history.
     *
     * @param sessionId The session ID
     * @param userMessage The user's message
     */
    public void addUserMessage(String sessionId, String userMessage) {
        ConversationSession session = getOrCreateSession(sessionId);
        session.addMessage("user", userMessage);
        trimHistory(session);
        log.debug("Added user message to session {}", sessionId);
    }

    /**
     * Adds an assistant (AI) message to the conversation history.
     *
     * @param sessionId The session ID
     * @param aiResponse The AI's response
     */
    public void addAssistantMessage(String sessionId, String aiResponse) {
        ConversationSession session = getOrCreateSession(sessionId);
        session.addMessage("assistant", aiResponse);
        trimHistory(session);
        log.debug("Added assistant message to session {}", sessionId);
    }

    /**
     * Gets the recent conversation context for the LLM.
     * Returns the last N messages as a formatted string.
     *
     * @param sessionId The session ID
     * @param contextSize How many recent messages to include (excluding current)
     * @return Formatted context string
     */
    public String getRecentContext(String sessionId, int contextSize) {
        ConversationSession session = sessions.get(sessionId);

        if (session == null || session.getMessages().isEmpty()) {
            return "";
        }

        List<Message> messages = session.getMessages();
        int startIdx = Math.max(0, messages.size() - contextSize);
        List<Message> recentMessages = messages.subList(startIdx, messages.size());

        StringBuilder context = new StringBuilder();
        for (Message msg : recentMessages) {
            String role = msg.role.equals("user") ? "User" : "Assistant";
            context.append(role).append(": ").append(msg.content).append("\n");
        }

        return context.toString();
    }

    /**
     * Gets all messages in a session.
     *
     * @param sessionId The session ID
     * @return List of message strings
     */
    public List<String> getConversationHistory(String sessionId) {
        ConversationSession session = sessions.get(sessionId);

        if (session == null) {
            return new ArrayList<>();
        }

        List<String> history = new ArrayList<>();
        for (Message msg : session.getMessages()) {
            String role = msg.role.equals("user") ? "User" : "Bot";
            history.add(role + ": " + msg.content);
        }

        return history;
    }

    /**
     * Clears a specific session.
     *
     * @param sessionId The session ID to clear
     */
    public void clearSession(String sessionId) {
        sessions.remove(sessionId);
        log.debug("Cleared session {}", sessionId);
    }

    /**
     * Clears all expired sessions.
     * Called periodically to clean up stale conversations.
     */
    public void clearExpiredSessions() {
        int beforeSize = sessions.size();

        sessions.entrySet().removeIf(entry ->
                entry.getValue().isExpired(sessionTimeoutMinutes)
        );

        int afterSize = sessions.size();
        if (beforeSize > afterSize) {
            log.info("Cleaned up {} expired sessions", beforeSize - afterSize);
        }
    }

    /**
     * Trims conversation history to max size.
     * Keeps the most recent messages.
     *
     * @param session The session to trim
     */
    private void trimHistory(ConversationSession session) {
        List<Message> messages = session.getMessages();
        if (messages.size() > maxHistorySize) {
            // Keep only the most recent maxHistorySize messages
            List<Message> trimmed = new ArrayList<>(
                    messages.subList(messages.size() - maxHistorySize, messages.size())
            );
            messages.clear();
            messages.addAll(trimmed);
            log.debug("Trimmed conversation history to {} messages", maxHistorySize);
        }
    }

    /**
     * Gets the total number of active sessions.
     *
     * @return Session count
     */
    public int getActiveSessionCount() {
        return sessions.size();
    }
}
