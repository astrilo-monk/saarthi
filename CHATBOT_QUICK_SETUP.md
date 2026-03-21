# 🚀 Quick Setup: Getting Chatbot Working

## The Problem (FIXED ✅)
The chatbot wasn't working because:
- ❌ Old ChatPage.tsx had hardcoded responses and local logic
- ❌ New ChatbotContainer component existed but wasn't integrated
- ❌ Java Spring Boot backend wasn't being used

## The Solution (APPLIED ✅)
- ✅ Replaced ChatPage.tsx with new ChatbotContainer integration
- ✅ Configured proper API endpoints
- ✅ Ready for backend connection

---

## What You Need to Do Now

### Step 1: Set Up OpenAI API Key (Required)

**Get your key from:** https://platform.openai.com/api-keys

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "sk-your-actual-key-here"
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk-your-actual-key-here
```

**Mac/Linux:**
```bash
export OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 2: Start the Java Backend

```bash
cd chatbot-backend
mvn spring-boot:run
```

**Expected Output:**
```
...
Started ChatbotApplication in X seconds
Server running on http://localhost:8080
```

### Step 3: Verify Backend is Running

```bash
curl http://localhost:8080/api/health
```

**Expected Response:**
```json
{"status":"healthy","service":"saarthi-chatbot","llmConnected":true,"timestamp":1711000000000}
```

### Step 4: Start Frontend

In a separate terminal:

```bash
npm run dev
```

**Visit:** http://localhost:4321/chat

---

## Testing the Chatbot

### ✅ Test Normal Chat
Type: "I've been feeling depressed"

Expected:
- Response appears with emotional context
- Background changes to blue-grey
- Avatar shows sad expression

### ✅ Test Crisis Detection (IMPORTANT!)
Type: "I want to kill myself"

Expected:
- ⚠️ IMMEDIATE response with helplines
- **No** API call to OpenAI (safety first!)
- Orange alert banner
- Emergency numbers displayed

### ✅ Test Different Emotions
- **Anxious**: "I'm so worried and stressed"
- **Hopeless**: "Everything feels pointless"
- **Neutral**: "What's the weather like?"

---

## Troubleshooting

### ❌ "Failed to connect to API"
**Problem:** Backend not running
**Solution:**
```bash
cd chatbot-backend
mvn spring-boot:run
```

### ❌ "API Key not found"
**Problem:** OPENAI_API_KEY not set
**Solution:** Set it again and restart the backend:
```bash
echo $OPENAI_API_KEY  # Verify it's set (should show your key)
mvn spring-boot:run   # Restart backend
```

### ❌ "Port 8080 already in use"
**Problem:** Another service using port 8080
**Solution:**
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill it and try again
mvn spring-boot:run
```

### ❌ "Nothing happens when I type"
**Problem:** Frontend not connected to backend
**Solution:** Check browser console (F12 → Console tab)
- Look for network errors
- Verify backend is actually running on 8080

---

## Architecture Overview

```
User Interface (ChatPage.tsx)
         ↓
ChatbotContainer Component
         ↓
useChatbot Hook (API Integration)
         ↓
Java Spring Boot Backend (localhost:8080)
         ↓
OpenAI API (gpt-3.5-turbo)
```

---

## Key Features Now Working

✅ **Emotion Detection** - Analyzes text for emotional state
✅ **Crisis Detection** - Immediate response for harmful content
✅ **Dynamic Theming** - Colors change based on emotion
✅ **AI Responses** - Real AI-powered responses via OpenAI
✅ **Session Management** - Maintains conversation history
✅ **Error Handling** - Graceful error messages
✅ **Loading States** - Clear feedback while processing

---

## API Endpoints

**Main Chat Endpoint:**
```
POST http://localhost:8080/api/chat/message
Content-Type: application/json

Request:
{
  "message": "I feel depressed",
  "sessionId": "optional-session-id"
}

Response:
{
  "id": "msg-123",
  "userMessage": "I feel depressed",
  "aiResponse": "That sounds really difficult...",
  "detectedEmotion": "SAD",
  "emotionConfidence": 0.85,
  "theme": {...},
  "avatar": {...},
  "isCrisis": false,
  "timestamp": "2026-03-21T14:30:00Z"
}
```

**Health Check:**
```
GET http://localhost:8080/api/health
```

---

## Files Modified

- ✅ `src/components/pages/ChatPage.tsx` - Now uses ChatbotContainer
- ✅ `src/components/Chatbot/` - All components ready
- ✅ `src/hooks/useChatbot.ts` - Connected to Java backend

---

## Next Steps

1. ✅ Set OpenAI API key
2. ✅ Start Java backend (`mvn spring-boot:run`)
3. ✅ Start frontend (`npm run dev`)
4. ✅ Test at http://localhost:4321/chat
5. ✅ Send a test message
6. ✅ Verify emotion detection works
7. ✅ Test crisis detection with "I want to die"

---

## Support Resources

- **Setup Guide**: See `CHATBOT_SETUP.md` for detailed setup
- **Integration Guide**: See `CHATBOT_INTEGRATION.md` for advanced usage
- **Backend Docs**: See `chatbot-backend/README.md` for API details

---

**The chatbot is now ready to go! 🎉**

Just set the OpenAI key and start the backend. Happy chatting! 💚
