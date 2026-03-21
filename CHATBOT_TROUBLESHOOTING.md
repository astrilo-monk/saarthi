# 🤖 Chatbot Response Issues - Troubleshooting

## Problem: Getting Wrong or Generic Responses

If you're getting inconsistent responses like "Thank you for sharing that with me", here's how to fix it.

---

## Issue 1: Emotion Detection Backend Offline

### Symptom:
- Responses feel generic/default
- Status shows "Offline"
- Emotion always shows "NEUTRAL"

### Fix:
```bash
cd backend
python emotion_api.py
```

Wait for:
```
 * Running on http://localhost:8000/
 * Loading emotion detection model...
 * Model loaded successfully!
```

---

## Issue 2: Java Backend Not Responding

### Symptom:
- "Failed to get response" error
- Messages don't send

### Fix:
```bash
cd chatbot-backend
$env:OPENAI_API_KEY = "sk-your-actual-key"  # PowerShell
mvn spring-boot:run
```

Verify it's running:
```bash
curl http://localhost:8080/api/health
```

Should show:
```json
{"status":"healthy","service":"saarthi-chatbot",...}
```

---

## Issue 3: OpenAI API Key Invalid

### Symptom:
- "Invalid API key" error in console
- Chatbot doesn't respond at all

### Fix:
1. Get new key: https://platform.openai.com/api-keys
2. Set it again:
   ```powershell
   $env:OPENAI_API_KEY = "sk-proj-your-new-key"
   ```
3. **Restart Java backend:**
   ```bash
   mvn spring-boot:run
   ```

---

## Issue 4: Inconsistent Quality

### Why This Happens:
- OpenAI model is temperature 0.7 (slightly random)
- Different emotions get different prompts
- Conversation history affects responses

### Example:
```
Message 1: "I'm sad"
Emotion: SAD → Empathetic response ✅

Message 2: "I think I'm good now"
Emotion: NEUTRAL → Generic response (expected, emotion changed)

Message 3: "Actually I still feel bad"
Emotion: SAD → Empathetic response ✅
```

This is **normal behavior** - emotion changes = response changes.

---

## Issue 5: Camera Not Working

### Symptom:
- Camera button shows "Offline"
- Can't enable emotion detection

### Fix:
```bash
cd backend
python emotion_api.py
```

Check it's running on port 8000:
```bash
curl http://localhost:8000/health
```

---

## Quick Test: Is API Working?

### Test Java Backend
```bash
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel sad"}'
```

**Should return:**
```json
{
  "id": "msg-123",
  "userMessage": "I feel sad",
  "aiResponse": "That sounds difficult...",
  "detectedEmotion": "SAD",
  "emotionConfidence": 0.85,
  ...
}
```

### Test Python Backend
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

**Should return:**
```json
{
  "success": true,
  "face_detected": true,
  "emotion": "happy",
  "confidence": 0.92
}
```

---

## Startup Checklist

- [ ] Python running on 8000: `python emotion_api.py`
- [ ] Java running on 8080: `mvn spring-boot:run`
- [ ] OpenAI key set: `echo $env:OPENAI_API_KEY`
- [ ] Frontend running on 4321: `npm run dev`
- [ ] Camera permissions granted in browser
- [ ] Browser console (F12) shows no errors

---

## Check Console Logs

### Browser Console (F12 → Console)
Look for errors like:
```
❌ GET http://localhost:8000/health net::ERR_CONNECTION_REFUSED
❌ POST http://localhost:8080/api/chat/message 401 Unauthorized
```

### Java Backend Logs
Look for:
```
❌ OPENAI_API_KEY not found
❌ No LLM connected
```

### Python Backend Logs
Look for:
```
❌ Model failed to load
❌ Camera error
```

---

## If Still Not Working

**Step 1:** Kill all processes
```bash
# Find Java process on 8080
netstat -ano | findstr :8080
# Kill it: taskkill /PID <PID> /F

# Find Python process on 8000
netstat -ano | findstr :8000
# Kill it: taskkill /PID <PID> /F
```

**Step 2:** Restart in order
```powershell
# Terminal 1
cd backend
python emotion_api.py

# Terminal 2
cd chatbot-backend
$env:OPENAI_API_KEY = "sk-your-key"
mvn spring-boot:run

# Terminal 3
npm run dev
```

**Step 3:** Visit http://localhost:4321/chat and test

---

## Expected Behavior

### Good Response ✅
```
User: "I've been feeling depressed"
Bot: "That sounds really difficult. Can you tell me what's been contributing to these feelings?"
Emotion: SAD (blue theme)
```

### Generic Response (but still OK) ✅
```
User: "What's the weather?"
Bot: "Thank you for sharing that. Can you tell me more about what you're experiencing?"
Emotion: NEUTRAL (grey theme)
```

### Crisis Response ✅
```
User: "I want to kill myself"
Bot: "I'm concerned about what you're sharing. Please reach out:
AASRA: +91-9820466726
iCall: +91-9152987821"
Emotion: CRITICAL (orange theme)
```

---

## Performance Tips

### Make It Faster:
1. Install GPU support for emotion detection (10x faster)
2. Use gpt-4-turbo instead of gpt-3.5 (better responses, costs more)
3. Close other browser tabs

### Make It Cheaper:
1. Use gpt-3.5-turbo (current, cheapest)
2. Reduce max tokens from 150 to 100

---

## Still Need Help?

Check these files:
- `chatbot-backend/README.md` - Java setup
- `backend/README.md` - Python setup (if exists)
- `EMOTION_DETECTION_SETUP.md` - Camera setup

---

**The chatbot should work great once all 3 services are running! 💚**
