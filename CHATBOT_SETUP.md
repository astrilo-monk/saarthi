# Saarthi Mental Health Chatbot - Complete Implementation Guide

## Overview

This is a production-quality, safety-first mental health support chatbot with:
- **Backend**: Java Spring Boot with AI safety features
- **Frontend**: React components with emotion-aware theming
- **LLM**: OpenAI API integration (pluggable)
- **Safety**: Crisis detection, emotion analysis, response validation

The chatbot is specifically designed to support users experiencing depression, anxiety, and related mental health challenges.

---

## Project Structure

```
campus-calm-main/
├── chatbot-backend/                    # Java Spring Boot backend
│   ├── src/main/java/com/saarthi/chatbot/
│   │   ├── ChatbotApplication.java     # Entry point
│   │   ├── config/                      # Spring configuration
│   │   ├── controller/
│   │   │   └── ChatController.java     # REST API endpoints
│   │   ├── service/
│   │   │   ├── ChatService.java        # Main orchestration
│   │   │   ├── ConversationService.java # History management
│   │   │   └── ResponseStrategyService.java # Prompt building
│   │   ├── safety/
│   │   │   ├── EmotionDetectorService.java  # Emotion analysis
│   │   │   └── CrisisDetectorService.java   # Crisis detection
│   │   ├── llm/
│   │   │   └── OpenAIClient.java       # LLM integration
│   │   └── model/                      # DTOs and enums
│   ├── src/main/resources/
│   │   └── application.properties      # Configuration
│   └── pom.xml                         # Maven dependencies
│
├── src/
│   ├── hooks/
│   │   ├── useEmotionTheme.ts          # Theme/color mapping
│   │   └── useChatbot.ts               # API integration hook
│   └── components/Chatbot/
│       ├── ChatbotContainer.tsx        # Main component
│       ├── Avatar.tsx                  # Emotional avatar
│       ├── MessageBubble.tsx          # Message display
│       ├── InputBox.tsx               # User input
│       └── index.ts                   # Exports
```

---

## Backend Setup (Java)

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- OpenAI API key (from https://platform.openai.com)

### Installation

1. **Navigate to backend directory**
```bash
cd chatbot-backend
```

2. **Install dependencies**
```bash
mvn clean install
```

3. **Create environment configuration**

Set your OpenAI API key as an environment variable:

**Linux/Mac:**
```bash
export OPENAI_API_KEY=sk-your-actual-key-here
export OPENAI_MODEL=gpt-3.5-turbo
```

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "sk-your-actual-key-here"
$env:OPENAI_MODEL = "gpt-3.5-turbo"
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk-your-actual-key-here
set OPENAI_MODEL=gpt-3.5-turbo
```

4. **Run the server**
```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

Verify with:
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "saarthi-chatbot",
  "llmConnected": true,
  "timestamp": 1711000000000
}
```

---

## Frontend Setup (React)

### Prerequisites
- Node.js 18+
- npm or yarn
- Running Java backend on port 8080

### Installation

1. **Navigate to project root**
```bash
cd /c/Users/dell/Desktop/campus-calm-main
```

2. **Install frontend dependencies (if needed)**
```bash
npm install
```

3. **The chatbot components are already created** in:
```
src/hooks/useEmotionTheme.ts
src/hooks/useChatbot.ts
src/components/Chatbot/ChatbotContainer.tsx
src/components/Chatbot/Avatar.tsx
src/components/Chatbot/MessageBubble.tsx
src/components/Chatbot/InputBox.tsx
```

4. **Update your ChatPage component** to use the new chatbot

In `/src/components/pages/ChatPage.tsx`, replace the keyword-based logic with:

```typescript
import { ChatbotContainer } from "@/components/Chatbot";

export default function ChatPage() {
  return (
    <div className="h-screen">
      <ChatbotContainer
        onEmotionChange={(emotion) => console.log("Emotion:", emotion)}
        onCrisisDetected={() => console.log("Crisis detected!")}
      />
    </div>
  );
}
```

5. **Start the dev server**
```bash
npm run dev
```

Visit `http://localhost:4321/chat` (or your configured dev URL)

---

## API Documentation

### POST /api/chat/message

Sends a user message and receives AI response with emotion analysis.

**Request:**
```json
{
  "message": "I've been feeling really down lately",
  "sessionId": "optional-session-id"
}
```

**Response (Success):**
```json
{
  "id": "msg-12345",
  "userMessage": "I've been feeling really down lately",
  "aiResponse": "I hear you. Feeling down can be really difficult. Can you tell me a bit more about what's been making you feel this way?",
  "detectedEmotion": "SAD",
  "emotionConfidence": 0.85,
  "theme": {
    "backgroundColor": "#e8f4f8",
    "accentColor": "#5b9aa0",
    "textColor": "#2c3e50"
  },
  "avatar": {
    "expression": "😔",
    "animation": "breathing"
  },
  "isCrisis": false,
  "timestamp": "2026-03-21T14:30:00Z",
  "sessionId": "session-12345"
}
```

**Response (Crisis Detected):**
```json
{
  "id": "crisis-12345",
  "userMessage": "I want to die",
  "aiResponse": "I'm genuinely concerned about what you're sharing. Please reach out for immediate support from professionals:\n\nAASRA: +91-9820466726\niCall: +91-9152987821\nVandrevala Foundation: +91-9999 666 555\n\nYou don't have to face this alone.",
  "detectedEmotion": "CRITICAL",
  "emotionConfidence": 1.0,
  "theme": {
    "backgroundColor": "#fff3e0",
    "accentColor": "#ff6f3c",
    "textColor": "#5d4037"
  },
  "avatar": {
    "expression": "🤝",
    "animation": "attentive"
  },
  "isCrisis": true,
  "timestamp": "2026-03-21T14:30:00Z",
  "sessionId": "session-12345"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "saarthi-chatbot",
  "llmConnected": true,
  "timestamp": 1711000000000
}
```

---

## Emotional States & Theming

### Supported Emotions

| Emotion | Detection Trigger | Avatar | Color | Animation |
|---------|-------------------|--------|-------|-----------|
| **SAD** | "depressed", "sad", "down", "miserable", "lonely" | 😔 | Cool blue-grey | breathing |
| **ANXIOUS** | "anxious", "worried", "scared", "stressed", "panic" | 😰 | Soft lavender | pulse |
| **HOPELESS** | "hopeless", "pointless", "worthless", "give up" | 😢 | Warm neutral | slow_breathing |
| **NEUTRAL** | No strong signals | 🙂 | Light grey | steady |
| **CRITICAL** | Crisis phrases (suicide, self-harm) | 🤝 | Alert orange-red | attentive |

### Crisis Detection Phrases

The system detects and immediately responds to:
- "want to die / kill myself / end my life"
- "better off dead / deserve to die"
- "slit my wrist / cut myself / overdose"
- "no point living / can't go on"
- And various other self-harm/suicide indicators

**CRITICAL**: These are detected BEFORE any LLM call. The response is immediate with helpline information.

---

## Safety Features

### 1. Crisis Detection (IRONCLAD)
- Checked FIRST, before emotion detection
- Pattern-based matching with multiple variations
- Immediately returns helpline response
- Logs every detection for monitoring
- Cannot be disabled in production

### 2. Emotion Detection
- Keyword-based analysis
- Confidence scoring (0-1)
- Guides LLM response strategy
- Only triggers theming if confidence > 0.6

### 3. Response Strategy Layer
- Constructs system prompt with safety rules
- Includes emotion-specific guidance
- Enforces: "no medical advice", "not a therapist", "keep it  brief"
- Provides conversation context

### 4. LLM Response Validation
- Checks for medical advice patterns
- Verifies response length (max 150 tokens)
- Validates against therapeutic claims
- Sanitizes output before returning

### 5. Conversation History
- Keeps last 5-10 messages per session
- Auto-expires sessions after 30 minutes
- Used only for context, not stored permanently
- Cleared on app restart

---

## Testing

### Backend Testing

#### 1. Test Health Endpoint
```bash
curl http://localhost:8080/api/health
```

#### 2. Test Normal Chat (Emotion Detection)
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel so depressed lately", "sessionId": "test-session-1"}'
```

Expected: Response with emotion="SAD", theme colors changed

#### 3. Test Crisis Detection (CRITICAL TEST)
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to kill myself", "sessionId": "test-session-2"}'
```

Expected:
- `isCrisis: true`
- `detectedEmotion: CRITICAL`
- Response includes helpline numbers
- NO LLM call should be made

#### 4. Test Anxiety Detection
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I am so anxious and panicking right now", "sessionId": "test-session-3"}'
```

Expected: emotion="ANXIOUS"

#### 5. Test Conversation History
```bash
# Same session ID should maintain context
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "That sounds really hard", "sessionId": "test-session-1"}'
```

### Frontend Testing

1. **Open chat page in browser**
   - Navigate to http://localhost:4321/chat

2. **Test Normal Conversation**
   - Type: "I've been feeling sad"
   - Verify: Avatar changes to 😔, background turns blue-grey

3. **Test Anxiety Response**
   - Type: "I'm so worried about everything"
   - Verify: Avatar changes to 😰, background turns lavender

4. **Test Emotion Persistence**
   - Send multiple messages
   - Avatar and colors should reflect detected emotion

5. **Test Crisis Banner**
   - Type: "I don't want to live"
   - Verify: Crisis warning appears with helplines
   - Verify: No loading spinner (no LLM call)

6. **Test Loading State**
   - Watch for animated dots while awaiting response
   - Send button should show spinner

7. **Test Input Validation**
   - Try sending empty message - should be disabled
   - Try 1000+ character message - should be truncated

8. **Test Auto-scroll**
   - Send multiple messages
   - Conversation should auto-scroll to newest message

---

## Configuration

### Backend Configuration (`application.properties`)

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# OpenAI
openai.api.key=${OPENAI_API_KEY}
openai.model=gpt-3.5-turbo
openai.temperature=0.7
openai.max-tokens=150

# Chatbot
chatbot.max-conversation-history=10
chatbot.session-timeout-minutes=30

# CORS
cors.allowed-origins=http://localhost:4321,http://localhost:3000
```

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-your-api-key

# Optional (defaults provided)
OPENAI_MODEL=gpt-3.5-turbo
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8080 is already in use
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows

# Check Java version
java -version  # Should be 17+

# Check Maven
mvn -v
```

### API Key Not Working
```bash
# Verify key is set
echo $OPENAI_API_KEY  # Mac/Linux
echo %OPENAI_API_KEY%  # Windows

# Test with curl
curl -X GET https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-key"
```

### CORS Issues in Frontend
- Ensure backend is running on 8080
- Check `application.properties` cors.allowed-origins includes your frontend URL
- Clear browser cache and restart

### Emotion Not Detecting
- Check if message contains the keywords
- Try: "I feel sad", "I'm anxious", "I feel hopeless"
- Check backend logs: `mvn spring-boot:run` should show detection logs

### Crisis Response Not Triggering
- Make sure backend is restarted after code changes
- Test with exact phrases or variations
- Check backend logs for "CRISIS DETECTED" message

---

## Production Checklist

- [ ] Set OpenAI API key via secure environment variable
- [ ] Configure CORS allow-origins for your domain
- [ ] Set proper logging levels (INFO for production)
- [ ] Implement database for conversation persistence
- [ ] Add monitoring and alerting for crisis detections
- [ ] Test all crisis phrases in production
- [ ] Load test the chatbot
- [ ] Document for support team
- [ ] Set up backup/disaster recovery
- [ ] Implement audit logging
- [ ] Set up SSL/TLS for all communications
- [ ] Rate limiting on chat endpoint
- [ ] Add user authentication/sessions

---

## Post-MVP Enhancements

- [ ] Persistent database (PostgreSQL)
- [ ] User profiles and history
- [ ] Admin dashboard for monitoring
- [ ] Advanced NLP for emotion detection
- [ ] Multi-language support
- [ ] Voice chat support
- [ ] Scheduled check-ins
- [ ] Integration with professional counselors
- [ ] Analytics and insights
- [ ] A/B testing for response strategies

---

## Support & Resources

### For Help
- Check backend logs: `mvn spring-boot:run`
- Check browser console: F12 → Console tab
- Test health endpoint: `curl http://localhost:8080/api/health`

### Mental Health Resources (India)
- **AASRA**: +91-9820466726
- **iCall**: +91-9152987821
- **Vandrevala Foundation**: +91-9999 666 555
- **NMHP Toll-free**: 1800-599-0019

### OpenAI Documentation
- https://platform.openai.com/docs/guides/chat
- https://platform.openai.com/account/api-keys

---

**Built with safety and care for vulnerable users. Always prioritize human mental health professionals over AI responses.**
