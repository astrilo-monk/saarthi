# Saarthi Mental Health Chatbot - Quick Reference

## 🚀 Quick Start (5 minutes)

### Backend (Java)
```bash
cd chatbot-backend
export OPENAI_API_KEY=sk-your-actual-key
mvn spring-boot:run
```
✅ Server ready at: http://localhost:8080/api

### Frontend (React)
```bash
# Already created, just integrate into ChatPage.tsx
import { ChatbotContainer } from "@/components/Chatbot";

function ChatPage() {
  return <ChatbotContainer />;
}
```

✅ Visit: http://localhost:4321/chat

---

## 📋 What Was Built

### Backend (Java Spring Boot)
✅ `ChatbotApplication.java` - Entry point
✅ `ChatController.java` - REST API endpoints
✅ `ChatService.java` - Main orchestration
✅ `CrisisDetectorService.java` - Crisis detection (CRITICAL)
✅ `EmotionDetectorService.java` - Emotion analysis
✅ `ResponseStrategyService.java` - Prompt building
✅ `OpenAIClient.java` - LLM integration
✅ `ConversationService.java` - History management
✅ DTOs, Models, Config classes

### Frontend (React)
✅ `ChatbotContainer.tsx` - Main component
✅ `Avatar.tsx` - Emotional avatar with animations
✅ `MessageBubble.tsx` - Message display
✅ `InputBox.tsx` - User input
✅ `useEmotionTheme.ts` - Theme/color hook
✅ `useChatbot.ts` - API integration hook

### Documentation
✅ `CHATBOT_SETUP.md` - Full setup guide
✅ `CHATBOT_INTEGRATION.md` - Integration examples
✅ `CHATBOT_QUICK_REF.md` - This file

---

## 🎯 Key Features

### Safety First ✨
- ✅ Crisis detection (detects self-harm phrases immediately)
- ✅ No LLM calls on crisis detection
- ✅ Helpline information embedded
- ✅ Response validation layer
- ✅ Emotion-aware prompting

### Emotion-Aware UI 🎨
- ✅ Avatar changes expression based on emotion
- ✅ Background colors change emotionally
- ✅ Animations reflect emotional intensity
- ✅ Real-time theme switching
- ✅ Smooth transitions

### AI-Powered 🧠
- ✅ OpenAI integration (pluggable)
- ✅ Emotion-guided responses
- ✅ Conversation context awareness
- ✅ Safety guardrails in system prompt
- ✅ Response length limiting

### User Experience 💬
- ✅ Real-time typing with auto-resize
- ✅ Auto-scroll to latest message
- ✅ Session persistence
- ✅ Loading states and error handling
- ✅ Smooth animations throughout

---

## 🧪 Testing Quick Commands

### Test 1: Normal Chat
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"I feel depressed"}'
```
Expected: SAD emotion, blue-grey colors, breathing animation

### Test 2: Crisis Detection (CRITICAL)
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"I want to die"}'
```
Expected: isCrisis=true, immediate helpline response, NO LLM call

### Test 3: Health Check
```bash
curl http://localhost:8080/api/health
```

---

## 📚 File Locations

### Backend
```
chatbot-backend/
├── pom.xml
└── src/main/java/com/saarthi/chatbot/
    ├── ChatbotApplication.java
    ├── controller/ChatController.java
    ├── service/
    │   ├── ChatService.java
    │   ├── ConversationService.java
    │   └── ResponseStrategyService.java
    ├── safety/
    │   ├── CrisisDetectorService.java
    │   └── EmotionDetectorService.java
    ├── llm/OpenAIClient.java
    └── model/
        ├── EmotionalState.java
        ├── ChatRequest.java
        ├── ChatResponse.java
        ├── EmotionAnalysis.java
        ├── CrisisAnalysis.java
        ├── EmotionThemeConfig.java

src/main/resources/
└── application.properties
```

### Frontend
```
src/
├── hooks/
│   ├── useEmotionTheme.ts
│   └── useChatbot.ts
└── components/Chatbot/
    ├── ChatbotContainer.tsx
    ├── Avatar.tsx
    ├── MessageBubble.tsx
    ├── InputBox.tsx
    └── index.ts
```

---

## 🎨 Emotion Colors & Expressions

| Emotion | Avatar | Color | Animation |
|---------|--------|-------|-----------|
| SAD | 😔 | #e8f4f8 (blue-grey) | breathing |
| ANXIOUS | 😰 | #f5e6f0 (lavender) | pulse |
| HOPELESS | 😢 | #faf0f0 (warm) | slow_breathing |
| NEUTRAL | 🙂 | #f9f9f9 (grey) | steady |
| CRITICAL | 🤝 | #fff3e0 (alert) | attentive |

---

## ⚠️ Crisis Detection Keywords

**Immediate Triggers:**
- "want to die"
- "kill myself"
- "end my life"
- "slit my wrist"
- "overdose"
- "better off dead"

**Response:** Immediate helpline numbers, NO LLM call

---

## 🔐 Security & Configuration

### Required
```bash
export OPENAI_API_KEY=sk-...
```

### Optional
```bash
export OPENAI_MODEL=gpt-3.5-turbo  # default
```

### Backend Config: `application.properties`
- `server.port` - Set to 8080
- `openai.api.key` - From environment
- `openai.temperature` - 0.7 (thoughtful but not random)
- `openai.max-tokens` - 150 (concise responses)
- `chatbot.max-conversation-history` - 10 messages
- `chatbot.session-timeout-minutes` - 30 minutes

---

## 🚨 Important Safety Notes

### CRITICAL: Crisis Detection
- ✅ Checked FIRST, before everything else
- ✅ NO LLM calls on crisis detection
- ✅ Returns fixed response with helplines
- ✅ Logged for monitoring
- ✅ Cannot be bypassed

### Helplines (India)
- 🆘 **AASRA**: +91-9820466726
- 🆘 **iCall**: +91-9152987821
- 🆘 **Vandrevala**: +91-9999 666 555

### System Rules (Always Enforced)
- ❌ NO medical advice
- ❌ NOT a therapist
- ❌ NO medication prescriptions
- ❌ NO dangerous clichés ("stay positive")
- ✅ Validate feelings
- ✅ Suggest small actions
- ✅ Encourage professional help

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port
lsof -i :8080
# Check Java
java -version  # should be 17+
# Check API key
echo $OPENAI_API_KEY
```

### No emotion detected
- Message needs keywords: "sad", "anxious", "depressed", etc.
- Check backend logs
- Confidence must be > 0.6

### Crisis detection not working
- Restart backend after edits
- Test with exact phrases: "I want to die"
- Check logs for "CRISIS DETECTED"

### Frontend can't connect to backend
- Backend must be running on 8080
- Check CORS in application.properties
- No proxy/firewall blocking

---

## 📊 Response Format (JSON)

```json
{
  "id": "msg-uuid",
  "userMessage": "user text",
  "aiResponse": "AI response",
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
  "sessionId": "session-xyz"
}
```

---

## 📱 Integration in 3 Steps

### 1. Update ChatPage.tsx
```typescript
import { ChatbotContainer } from "@/components/Chatbot";

export default function ChatPage() {
  return <ChatbotContainer />;
}
```

### 2. Start Backend
```bash
cd chatbot-backend
export OPENAI_API_KEY=sk-your-key
mvn spring-boot:run
```

### 3. Run Frontend
```bash
npm run dev
# Visit http://localhost:4321/chat
```

---

## 🎓 Learning Resources

**Backend:**
- Spring Boot: https://spring.io/projects/spring-boot
- OpenAI API: https://platform.openai.com/docs

**Frontend:**
- React: https://react.dev
- Framer Motion: https://www.framer.com/motion

**Mental Health:**
- AASRA: https://aasra.info
- iCall: https://icallhelpline.org

---

## 📞 Support

- **Setup Issues**: Check `CHATBOT_SETUP.md`
- **Integration**: Check `CHATBOT_INTEGRATION.md`
- **Backend Logs**: `mvn spring-boot:run` output
- **Frontend Logs**: Browser DevTools (F12)
- **API Testing**: Use curl commands above

---

**Built with ❤️ for vulnerable users. Safety first, always.**
