"""
emotion_api.py

FastAPI backend for real-time emotion detection using DeepFace.
Receives base64-encoded images from the React frontend and returns detected emotion.

Usage:
    uvicorn backend.emotion_api:app --reload --port 8000
"""

import cv2
import numpy as np
import base64
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Try to import DeepFace
DEEPFACE_AVAILABLE = False
DeepFace = None
try:
    from deepface import DeepFace as DF
    DeepFace = DF
    DEEPFACE_AVAILABLE = True
    logger.info("DeepFace loaded successfully")
except Exception as e:
    logger.warning(f"DeepFace import failed: {e}")
    DEEPFACE_AVAILABLE = False

app = FastAPI(title="Saarthi Emotion Detection API")

# CORS middleware - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins is "*"
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Config
ANALYZE_SIZE = (320, 240)
DETECTOR_BACKEND = 'opencv'
ENFORCE_DETECTION = False


class ImageRequest(BaseModel):
    image: str  # base64 encoded image


# Global exception handler to ensure CORS headers are always sent
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "face_detected": False,
            "emotion": None,
            "error": str(exc)
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode base64 image string to OpenCV image array."""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]

        # Decode base64
        img_bytes = base64.b64decode(base64_string)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            logger.error("cv2.imdecode returned None")
        else:
            logger.debug(f"Image decoded successfully: {img.shape}")

        return img
    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        return None


def haar_detect_faces(gray_frame):
    """Fallback face detection using Haar cascades."""
    try:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        face_cascade = cv2.CascadeClassifier(cascade_path)
        faces = face_cascade.detectMultiScale(
            gray_frame,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        return len(faces) > 0
    except Exception as e:
        logger.error(f"Haar detection error: {e}")
        return False


@app.get("/")
async def root():
    return {
        "message": "Saarthi Emotion Detection API",
        "deepface_available": DEEPFACE_AVAILABLE,
        "endpoints": {
            "/analyze": "POST - Analyze emotion from base64 image",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "deepface_available": DEEPFACE_AVAILABLE
    }


@app.post("/analyze")
async def analyze_emotion(request: ImageRequest):
    """
    Analyze emotion from a base64-encoded image.
    Returns the dominant emotion and confidence scores.
    """
    logger.info("Received analyze request")

    try:
        # Check if image data is present
        if not request.image:
            logger.warning("No image data received")
            return {
                "success": False,
                "face_detected": False,
                "emotion": None,
                "error": "No image data"
            }

        # Decode the image
        logger.debug("Decoding image...")
        img = decode_base64_image(request.image)

        if img is None:
            logger.warning("Failed to decode image")
            return {
                "success": False,
                "face_detected": False,
                "emotion": None,
                "error": "Failed to decode image"
            }

        logger.debug(f"Image shape: {img.shape}")

        # Resize for faster processing
        small = cv2.resize(img, ANALYZE_SIZE)
        logger.debug(f"Resized to: {small.shape}")

        if DEEPFACE_AVAILABLE and DeepFace is not None:
            try:
                logger.debug("Running DeepFace analysis...")
                # Analyze with DeepFace
                result = DeepFace.analyze(
                    img_path=small,
                    actions=['emotion'],
                    detector_backend=DETECTOR_BACKEND,
                    enforce_detection=ENFORCE_DETECTION
                )

                logger.debug(f"DeepFace result type: {type(result)}")

                # Handle both list and dict returns
                if isinstance(result, list) and result:
                    result = result[0]

                if isinstance(result, dict):
                    dominant_emotion = result.get('dominant_emotion', 'neutral')
                    emotion_scores = result.get('emotion', {})
                    confidence = emotion_scores.get(dominant_emotion, 0)

                    logger.info(f"Detected emotion: {dominant_emotion} ({confidence}%)")

                    return {
                        "success": True,
                        "emotion": dominant_emotion,
                        "confidence": round(confidence, 2),
                        "all_emotions": emotion_scores,
                        "face_detected": True,
                        "error": None
                    }
                else:
                    logger.warning(f"Unexpected result format: {result}")

            except Exception as e:
                logger.warning(f"DeepFace analysis failed: {e}")
                logger.debug(traceback.format_exc())
                # Fall back to Haar cascade for face detection only
                gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
                face_detected = haar_detect_faces(gray)
                return {
                    "success": True,
                    "emotion": "neutral" if face_detected else None,
                    "confidence": None,
                    "all_emotions": None,
                    "face_detected": face_detected,
                    "error": f"DeepFace failed: {str(e)}"
                }
        else:
            # No DeepFace, use Haar cascade
            logger.info("DeepFace not available, using Haar cascade")
            gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
            face_detected = haar_detect_faces(gray)
            return {
                "success": True,
                "emotion": "neutral" if face_detected else None,
                "confidence": None,
                "all_emotions": None,
                "face_detected": face_detected,
                "error": "DeepFace not available"
            }

    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "face_detected": False,
            "emotion": None,
            "confidence": None,
            "all_emotions": None,
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
