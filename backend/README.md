# Saarthi Emotion Detection Backend

This backend provides real-time emotion detection using DeepFace for the Saarthi mental health platform.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A webcam (for emotion detection)

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv

   # On Windows:
   venv\Scripts\activate

   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   **Note:** DeepFace will download required model files (~500MB) on first run.

## Running the Backend

Start the FastAPI server:

```bash
# From the project root directory:
uvicorn backend.emotion_api:app --reload --port 8000

# Or from the backend directory:
cd backend
uvicorn emotion_api:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```
Returns backend status and whether DeepFace is available.

### Analyze Emotion
```
POST /analyze
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

Response:
```json
{
  "success": true,
  "emotion": "happy",
  "confidence": 85.32,
  "all_emotions": {
    "angry": 0.5,
    "disgust": 0.1,
    "fear": 1.2,
    "happy": 85.32,
    "sad": 5.8,
    "surprise": 2.1,
    "neutral": 5.0
  },
  "face_detected": true
}
```

## Running Both Frontend and Backend

1. **Terminal 1 - Start the Backend:**
   ```bash
   cd c:\Users\dell\Desktop\campus-calm-main
   uvicorn backend.emotion_api:app --reload --port 8000
   ```

2. **Terminal 2 - Start the Frontend:**
   ```bash
   cd c:\Users\dell\Desktop\campus-calm-main
   npm run dev
   ```

3. Open `http://localhost:4321` in your browser

## How It Works

1. When the user enables the camera on the chat page, the frontend captures video frames every 2 seconds
2. Each frame is converted to base64 and sent to the `/analyze` endpoint
3. DeepFace analyzes the image and returns the dominant emotion
4. The chatbot uses this emotion to provide more empathetic, context-aware responses

## Troubleshooting

### DeepFace not loading
If you see "DeepFace import failed", try:
```bash
pip install deepface tf-keras tensorflow
```

### CORS errors
The backend allows requests from common development ports. If you're using a different port, update the `allow_origins` list in `emotion_api.py`.

### Camera not working
- Ensure your browser has camera permissions for the site
- Try using Chrome or Edge for best compatibility

## Supported Emotions

DeepFace detects these emotions:
- Happy 😊
- Sad 😢
- Angry 😠
- Fear 😨
- Surprise 😲
- Disgust 🤢
- Neutral 😐
