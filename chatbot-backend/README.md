# Saarthi Mental Health Chatbot Backend

Production-quality Java Spring Boot application for AI-powered mental health support with built-in safety features.

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- OpenAI API key: https://platform.openai.com/api-keys

### 1. Set API Key (Required)

**Linux/Mac:**
```bash
export OPENAI_API_KEY=sk-your-actual-key-here
```

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "sk-your-actual-key-here"
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk-your-actual-key-here
```

### 2. Run Server
```bash
mvn spring-boot:run
```

### 3. Test Health
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{"status": "healthy", "llmConnected": true}
```

---

## API Endpoints

### POST /api/chat/message
Send message and get AI response with emotion analysis.

**Request:**
```json
{
  "message": "I've been feeling down",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "id": "msg-123",
  "userMessage": "I've been feeling down",
  "aiResponse": "That sounds really difficult. Can you tell me more...",
  "detectedEmotion": "SAD",
  "emotionConfidence": 0.85,
  "theme": {"backgroundColor": "#e8f4f8", ...},
  "avatar": {"expression": "😔", "animation": "breathing"},
  "isCrisis": false,
  "timestamp": "2026-03-21T14:30:00Z"
}
```

### GET /api/health
Health check endpoint.

---

## Project Structure

```
src/main/java/com/saarthi/chatbot/
├── ChatbotApplication.java          # Entry point
├── controller/ChatController.java    # REST endpoints
├── service/
│   ├── ChatService.java            # Main orchestration
│   ├── ConversationService.java    # History management
│   └── ResponseStrategyService.java # Prompt building
├── safety/
│   ├── CrisisDetectorService.java  # Crisis detection ⚠️
│   └── EmotionDetectorService.java # Emotion analysis
├── llm/
│   └── OpenAIClient.java           # OpenAI integration
└── model/                          # DTOs and enums
```

---

## Safety Features

### Crisis Detection (Ironclad)
✅ Detects self-harm phrases BEFORE LLM calls
✅ Returns immediate helpline response
✅ No LLM involvement
✅ Logged for monitoring

**Detected Phrases:**
- "want to die", "kill myself", "end my life"
- "slit my wrist", "overdose", "better off dead"
- And many other variations

**Helplines (India):**
- AASRA: +91-9820466726
- iCall: +91-9152987821
- Vandrevala Foundation: +91-9999 666 555

### Emotion-Aware Responses
✅ Detects: SAD, ANXIOUS, HOPELESS, NEUTRAL
✅ Adjusts system prompt based on emotion
✅ Provides context-aware guidance

### Response Validation
✅ Checks for medical advice
✅ Verifies therapist claims
✅ Validates response length
✅ Sanitizes output

---

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# OpenAI
openai.api.key=${OPENAI_API_KEY}
openai.model=gpt-3.5-turbo
openai.temperature=0.7           # Thoughtful, not random
openai.max-tokens=150            # Concise responses
openai.top-p=0.95

# Chatbot
chatbot.max-conversation-history=10
chatbot.session-timeout-minutes=30

# CORS
cors.allowed-origins=http://localhost:4321,http://localhost:3000
```

---

## Testing

### Test 1: Normal Conversation
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel so depressed lately"}'
```

Expected: emotion="SAD", blue-grey theme

### Test 2: Crisis Detection (CRITICAL TEST)
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to kill myself"}'
```

Expected: isCrisis=true, helplines provided, NO LLM call

### Test 3: Anxiety Response
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I am panicking and so stressed"}'
```

Expected: emotion="ANXIOUS", lavender theme

---

## Troubleshooting

### "API Key not found"
```bash
echo $OPENAI_API_KEY  # Verify key is set
# If empty, set it again before running
```

### "Port 8080 already in use"
```bash
# Mac/Linux
lsof -i :8080
# Windows
netstat -ano | findstr :8080

# Kill the process or use different port in application.properties
```

### "Java not found"
```bash
java -version  # Must be 17+
# Install Java 17: https://www.oracle.com/java/technologies/downloads/
```

### "Maven not found"
```bash
mvn -v
# Install Maven: https://maven.apache.org/install.html
```

---

## Logs & Debugging

### View Full Logs
```bash
mvn spring-boot:run -X
```

### Check Crisis Detection
Logs will show: `CRISIS DETECTED - Self-harm/suicide phrase detected`

### Check Emotion Detection
Logs will show: `Emotion detected: SAD with confidence 0.85`

---

## Deployment

### Docker

Create `Dockerfile`:
```dockerfile
FROM maven:3.8.1-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package

FROM openjdk:17-alpine
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t saarthi-chatbot .
docker run -e OPENAI_API_KEY=sk-... -p 8080:8080 saarthi-chatbot
```

### Production Checklist

- [ ] API key configured via environment variable
- [ ] CORS configured for your domain
- [ ] Logging level set to INFO
- [ ] Database implemented for persistence (post-MVP)
- [ ] Rate limiting on /chat/message endpoint
- [ ] Monitoring for crisis detections
- [ ] Backup strategy in place
- [ ] SSL/TLS configured
- [ ] Load testing completed

---

## Post-MVP Enhancements

- [ ] PostgreSQL database for persistence
- [ ] User authentication and sessions
- [ ] Advanced NLP for emotion detection
- [ ] Admin dashboard for monitoring
- [ ] Analytics and insights
- [ ] Multi-language support
- [ ] Voice chat support
- [ ] Integration with professional counselors
- [ ] Schedule follow-up reminders

---

## Documentation

- **Full Setup Guide**: `../CHATBOT_SETUP.md`
- **Integration Guide**: `../CHATBOT_INTEGRATION.md`
- **Quick Reference**: `../CHATBOT_QUICK_REF.md`

---

## Support Resources

### For Developers
- Spring Boot: https://spring.io/projects/spring-boot
- OpenAI API: https://platform.openai.com/docs/guides/chat
- Java: https://docs.oracle.com/javase/17/

### For Users (Mental Health)
- AASRA: https://aasra.info
- iCall: https://icallhelpline.org
- Vandrevala Foundation: https://vandrevalafoundation.org

---

**Built with care for vulnerable users. Always prioritize human professionals over AI.**
