# 🎥 Emotion Detection Model Setup

The chatbot has **facial emotion detection** that analyzes your face via camera and feeds that emotion context to the AI responses.

---

## What You Need

- **Python 3.8+** - Must be installed
- **Camera** - Working webcam
- **GPU (Optional)** - Makes it faster, but CPU works fine

---

## Step 1: Install Python Dependencies

### Check Python Version First
```bash
python --version
# Should show 3.8 or higher
```

### Install Requirements
```bash
cd backend
pip install -r requirements.txt
```

**This installs:**
- `flask` - Web server
- `opencv-python` - Camera access
- `tensorflow` - Deep learning
- `numpy` - Math operations

**First time setup takes 2-3 minutes** (downloading neural networks)

---

## Step 2: Start the Emotion Detection Backend

```bash
cd backend
python emotion_api.py
```

**You'll see:**
```
 * Running on http://localhost:8000/
 * Loading emotion detection model...
 * Model loaded successfully!
```

**This must be running for the camera 📹 button to work!**

---

## Step 3: Test in Browser

1. Start emotion backend (port 8000)
2. Start Java backend (port 8080)
3. Start frontend (http://localhost:4321)
4. Click the **📹 Camera** button

**You should see:**
- ✅ Status: "Connected" (green)
- ✅ Live video feed
- ✅ Detected emotion with emoji
- ✅ Confidence %

---

## How It Works

### The Process:
```
1. You click Camera button
   ↓
2. Browser gets permission to access webcam
   ↓
3. Every 2 seconds, frame is captured
   ↓
4. Frame sent to Python backend (localhost:8000)
   ↓
5. Neural network analyzes face
   ↓
6. Emotion returned (happy, sad, angry, etc.)
   ↓
7. Chatbot uses this emotion for context
   ↓
8. Response changes based on emotion + text
```

### Emotions Detected:
- 😊 **Happy** - Joyful, positive
- 😢 **Sad** - Down, depressed
- 😠 **Angry** - Frustrated, irritated
- 😨 **Fear** - Scared, anxious
- 😲 **Surprise** - Surprised
- 🤢 **Disgust** - Uncomfortable
- 😐 **Neutral** - No clear emotion

---

## Troubleshooting

### ❌ "Offline" Status in Chat
**Problem:** Python backend not running

**Solution:**
```bash
cd backend
python emotion_api.py
```

### ❌ "Camera permission denied"
**Problem:** Browser doesn't have camera access

**Solution:**
1. Check browser permissions (Settings)
2. Allow camera for localhost:4321
3. Reload page

### ❌ "Unable to access camera"
**Problem:** Camera not available or disabled

**Solution:**
1. Check camera is plugged in
2. No other app is using camera
3. Grant browser permission to camera
4. Restart browser

### ❌ Model Download Fails
**Problem:** Internet issue downloading neural network

**Solution:**
```bash
# Try again - it auto-retries
python emotion_api.py

# Or manually download model:
cd backend
python -c "import tensorflow as tf; tf.keras.applications.mobilenet_v2.MobileNetV2()"
```

### ❌ Takes Too Long to Analyze
**Problem:** CPU-based (no GPU)

**Solution:**
- Normal (takes 0.5-1 second per frame)
- Install GPU support for faster: https://www.tensorflow.org/install/gpu

---

## Full Startup Sequence

**Terminal 1 - Emotion Detection (Port 8000):**
```bash
cd backend
python emotion_api.py
```
*Wait for "Model loaded"*

**Terminal 2 - AI Chatbot (Port 8080):**
```bash
cd chatbot-backend
$env:OPENAI_API_KEY = "sk-your-key"  # PowerShell
mvn spring-boot:run
```
*Wait for "Started ChatbotApplication"*

**Terminal 3 - Frontend (Port 4321):**
```bash
npm run dev
```
*Visit http://localhost:4321/chat*

---

## Testing Emotion Detection

### Test 1: Normal Face
1. Click Camera 📹
2. Show happy face
3. Should detect "happy" ✅

### Test 2: Different Emotion
1. Keep camera on
2. Make sad face
3. Should detect "sad" ✅

### Test 3: Chat with Emotion
1. Camera detecting "sad"
2. Type: "i feel depressed"
3. Chatbot should respond with empathy ✅

---

## What Happens if Backend Offline

**Camera Button:**
- Shows "Offline" status
- Still captures video
- But emotion detection doesn't work
- Just type messages normally

---

## Advanced: GPU Support (Optional)

For 10x faster emotion detection:

```bash
pip install tensorflow[and-cuda]
# or for AMD GPU:
pip install tensorflow[and-rocm]
```

Restart Python backend and it will auto-use GPU.

---

## File Structure

```
backend/
├── emotion_api.py         # Main server
├── requirements.txt       # Dependencies
├── emotion_model.py       # Neural network
└── test_emotion.py        # Testing script
```

---

## Debug Mode

Want to see what's happening?

```bash
cd backend
python emotion_api.py --debug
```

Shows detailed logs of each detection.

---

## Still Not Working?

Try this debug script:

```bash
cd backend
python test_emotion.py
```

This tests:
- ✅ Camera access
- ✅ Model loading
- ✅ Emotion detection
- ✅ API server

---

## Summary

| Component | Port | Command |
|-----------|------|---------|
| Emotion Detection (Python) | 8000 | `python emotion_api.py` |
| AI Chatbot (Java) | 8080 | `mvn spring-boot:run` |
| Frontend (Astro) | 4321 | `npm run dev` |

**All three needed for full chatbot with emotion detection.**

---

**Everything set up? Try the camera button now! 🎥**
