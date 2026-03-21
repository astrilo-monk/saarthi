/**
 * ChatbotContainer Component
 *
 * Main wrapper component for the AI mental health chatbot.
 * Orchestrates all chat functionality:
 * - Message display with animation
 * - Emotion-aware theming
 * - Avatar with emotional expressions
 * - User input with camera/mic support
 * - Crisis detection/response
 * - Facial emotion detection via camera
 * - Speech-to-text via microphone
 *
 * Fully emotion-aware - changes colors, avatar, and animations based on detected emotion.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Mic, MicOff, X } from "lucide-react";
import useChatbot from "@/hooks/useChatbot";
import { useEmotionTheme } from "@/hooks/useEmotionTheme";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatbotContainerProps {
  initialMessage?: string;
  onEmotionChange?: (emotion: string) => void;
  onCrisisDetected?: () => void;
}

export function ChatbotContainer({
  initialMessage,
  onEmotionChange,
  onCrisisDetected,
}: ChatbotContainerProps) {
  const { messages, isLoading, error, currentEmotion, isCrisis, sendMessage, clearError } =
    useChatbot();
  const theme = useEmotionTheme(currentEmotion);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Camera and Mic state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [emotionConfidence, setEmotionConfidence] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"connecting" | "connected" | "error">("connecting");

  // Refs for camera and speech
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Backend API URL for emotion detection
  const EMOTION_API_URL = "http://localhost:8000";

  // Wrap sendMessage to show user message immediately
  const handleSendMessage = useCallback((message: string) => {
    setLastUserMessage(message);
    sendMessage(message);
  }, [sendMessage]);

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${EMOTION_API_URL}/health`);
        if (response.ok) {
          setBackendStatus("connected");
        } else {
          setBackendStatus("error");
        }
      } catch {
        setBackendStatus("error");
      }
    };
    checkBackend();
  }, []);

  // Capture frame from video and send to API
  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8);

    try {
      setIsAnalyzing(true);
      const response = await fetch(`${EMOTION_API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.face_detected && result.emotion) {
          setDetectedEmotion(result.emotion);
          setEmotionConfidence(result.confidence);
        } else if (!result.face_detected) {
          setDetectedEmotion(null);
          setEmotionConfidence(null);
        }
      }
    } catch (error) {
      console.error("Error analyzing emotion:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Start real emotion detection
  const startEmotionDetection = useCallback(() => {
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
    }

    emotionIntervalRef.current = setInterval(() => {
      if (streamRef.current) {
        captureAndAnalyzeFrame();
      }
    }, 2000);

    captureAndAnalyzeFrame();
  }, [captureAndAnalyzeFrame]);

  // Stop emotion detection
  const stopEmotionDetection = useCallback(() => {
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
      emotionIntervalRef.current = null;
    }
  }, []);

  // Camera toggle function
  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      // Turn off camera
      stopEmotionDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      setDetectedEmotion(null);
      setEmotionConfidence(null);
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Unable to access camera. Please check permissions.");
      }
    }
  }, [isCameraOn, stopEmotionDetection]);

  // Effect to attach stream to video element when camera turns on
  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;

      const startDetection = () => {
        setTimeout(() => startEmotionDetection(), 1000);
      };

      if (video.readyState >= 3) {
        video.play().then(startDetection).catch(() => {});
      } else {
        const handleCanPlay = () => {
          video.play().then(startDetection).catch(() => {});
        };

        video.addEventListener("canplay", handleCanPlay, { once: true });

        return () => {
          video.removeEventListener("canplay", handleCanPlay);
        };
      }
    }
  }, [isCameraOn, startEmotionDetection]);

  // Speech recognition toggle
  const toggleMic = useCallback(() => {
    if (isMicOn) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsMicOn(false);
      setIsListening(false);
    } else {
      // Start listening
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript("");
          // Auto-send final transcript
          if (finalTranscript.trim()) {
            handleSendMessage(finalTranscript);
          }
        }
        setTranscript(interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsMicOn(false);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isMicOn) {
          // Restart if still supposed to be on
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsMicOn(true);
      setIsListening(true);
    }
  }, [isMicOn, sendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEmotionDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [stopEmotionDetection]);

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Notify parent when emotion changes
  useEffect(() => {
    onEmotionChange?.(currentEmotion);
  }, [currentEmotion, onEmotionChange]);

  // Clear last user message when response arrives
  useEffect(() => {
    if (!isLoading && lastUserMessage && messages.length > 0) {
      setLastUserMessage(null);
    }
  }, [isLoading, messages]);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      sendMessage(initialMessage);
    }
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="chatbot-container flex flex-col h-screen rounded-2xl overflow-hidden shadow-2xl"
      style={{ backgroundColor: "#f0fdf4" }}
    >
      {/* Header with Avatar */}
      <motion.div
        className="chatbot-header p-6 flex flex-col items-center gap-3 border-b border-gray-200"
      >
        <Avatar
          expression={messages.length === 0 ? "🙂" : messages[messages.length - 1].avatar.expression}
          animation={messages.length === 0 ? "steady" : messages[messages.length - 1].avatar.animation}
          emotion={currentEmotion}
        />
        <h1 className="text-2xl font-bold text-gray-800">
          Saarthi
        </h1>
        <p className="text-sm text-gray-600">
          {isCrisis
            ? "🚨 Crisis support available - please reach out"
            : "Your mental health companion"}
        </p>
      </motion.div>

      {/* Camera Preview Panel - Hidden for clean UI */}
      <div className="hidden">
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} />
      </div>

      {/* Messages Container */}
      <motion.div
        ref={messagesContainerRef}
        className="chatbot-messages flex-1 overflow-y-auto p-6 space-y-4"
        style={{ backgroundColor: "#fafff9" }}
        layout
      >
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full text-center"
          >
            <div>
              <p className="text-2xl font-semibold mb-3 text-gray-800">
                Welcome to Saarthi
              </p>
              <p className="text-gray-600">
                Share what's on your mind. I'm here to listen and support you with care and understanding.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* User Message */}
              <MessageBubble
                isUser={true}
                message={msg.userMessage}
                timestamp={msg.timestamp}
              />

              {/* AI Response */}
              <MessageBubble
                isUser={false}
                message={msg.aiResponse}
                emotion={msg.detectedEmotion}
                isCrisis={msg.isCrisis}
                timestamp={msg.timestamp}
                accentColor={theme.accentColor}
                textColor={theme.textColor}
              />
            </div>
          ))}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && lastUserMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {/* Show pending user message */}
            <MessageBubble
              isUser={true}
              message={lastUserMessage}
            />
            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 p-4 rounded"
          >
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 text-xs underline mt-2 hover:text-red-800"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </motion.div>

      {/* Footer - Input Box with Camera/Mic */}
      <motion.div className="chatbot-footer p-6 border-t border-gray-200 bg-white">
        {/* Listening indicator */}
        <AnimatePresence>
          {isListening && transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 p-2 rounded text-sm bg-blue-50 text-blue-700"
            >
              <span className="font-medium">
                Listening:
              </span>{" "}
              {transcript}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Box */}
        <InputBox
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          accentColor={theme.accentColor}
          placeholderText={isMicOn ? "Speak or type..." : "Share your thoughts..."}
          onCameraToggle={toggleCamera}
          onMicToggle={toggleMic}
          isCameraOn={isCameraOn}
          isMicOn={isMicOn}
        />
      </motion.div>
    </motion.div>
  );
}

export default ChatbotContainer;
