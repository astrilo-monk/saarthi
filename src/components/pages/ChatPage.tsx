import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, AlertTriangle, Phone, Mic, MicOff, Camera, CameraOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Extend Window interface for SpeechRecognition
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm here to provide confidential support and resources. How are you feeling today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Camera and Mic state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Emotion detection state
  const [emotionConfidence, setEmotionConfidence] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Refs for camera and speech
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Backend API URL
  const EMOTION_API_URL = 'http://localhost:8000';

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${EMOTION_API_URL}/health`);
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch {
        setBackendStatus('error');
        console.log('Emotion detection backend not available. Camera will work without emotion detection.');
      }
    };
    checkBackend();
  }, []);

  // Capture frame from video and send to API
  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      console.log('Missing refs:', { video: !!videoRef.current, canvas: !!canvasRef.current, stream: !!streamRef.current });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Check if video is ready and playing
    if (!context || video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
      console.log('Video not ready:', { width: video.videoWidth, height: video.videoHeight, paused: video.paused });
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      setIsAnalyzing(true);
      const response = await fetch(`${EMOTION_API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Emotion result:', result);
        if (result.success && result.face_detected && result.emotion) {
          setDetectedEmotion(result.emotion);
          setEmotionConfidence(result.confidence);
        } else if (!result.face_detected) {
          setDetectedEmotion(null);
          setEmotionConfidence(null);
        }
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Start real emotion detection
  const startEmotionDetection = useCallback(() => {
    console.log('startEmotionDetection called, backendStatus:', backendStatus);

    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
    }

    // Analyze every 2 seconds
    emotionIntervalRef.current = setInterval(() => {
      console.log('Interval tick, stream exists:', !!streamRef.current, 'backendStatus:', backendStatus);
      if (streamRef.current) {
        captureAndAnalyzeFrame();
      }
    }, 2000);

    // Run immediately
    console.log('Running initial analysis');
    captureAndAnalyzeFrame();
  }, [captureAndAnalyzeFrame, backendStatus]);

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
        streamRef.current.getTracks().forEach(track => track.stop());
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
            facingMode: 'user'
          }
        });
        streamRef.current = stream;
        // Set camera on first so the video element renders
        setIsCameraOn(true);
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please check permissions.');
      }
    }
  }, [isCameraOn, stopEmotionDetection]);

  // Effect to attach stream to video element when camera turns on
  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;

      const startDetection = () => {
        console.log('Video ready, starting emotion detection');
        // Start emotion detection after video is confirmed ready
        setTimeout(() => {
          console.log('Calling startEmotionDetection, backendStatus:', backendStatus);
          startEmotionDetection();
        }, 1000);
      };

      // Check if video is already ready
      if (video.readyState >= 3) {
        // Video is already ready (HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA)
        video.play().then(startDetection).catch(err => {
          console.error('Error playing video:', err);
        });
      } else {
        // Wait for video to be ready
        const handleCanPlay = () => {
          video.play().then(startDetection).catch(err => {
            console.error('Error playing video:', err);
          });
        };

        video.addEventListener('canplay', handleCanPlay, { once: true });

        return () => {
          video.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [isCameraOn, startEmotionDetection, backendStatus]);

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
        alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputText(prev => prev + finalTranscript + ' ');
        }
        setTranscript(interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
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
  }, [isMicOn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEmotionDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [stopEmotionDetection]);

  const emergencyKeywords = ['help', 'suicidal', 'crisis', 'suicide', 'kill myself', 'end it all', 'hurt myself', 'self harm'];

  // Get emotion-aware response prefix
  const getEmotionContext = (emotion: string | null): string => {
    if (!emotion) return '';

    const emotionResponses: Record<string, string> = {
      happy: "I can see you're in a positive mood! ",
      sad: "I notice you seem a bit down. I'm here for you. ",
      angry: "I sense some frustration. It's okay to feel that way. ",
      fear: "I can see something might be worrying you. ",
      surprise: "Something seems to have caught your attention! ",
      disgust: "I notice you might be uncomfortable. ",
      neutral: "",
      anxious: "I can see you might be feeling anxious. Take a deep breath. ",
      calm: "You seem relaxed, which is great! ",
      stressed: "I notice some tension. Let's work through this together. "
    };

    return emotionResponses[emotion.toLowerCase()] || '';
  };

  const getAIResponse = (userMessage: string, currentEmotion: string | null): string => {
    const lowerMessage = userMessage.toLowerCase();
    const emotionPrefix = getEmotionContext(currentEmotion);

    // Check for emergency keywords
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      setShowEmergencyBanner(true);
      return "I'm concerned about what you're sharing. Please know that you're not alone, and there are people who want to help. If you're in immediate danger, please call 022 2754 6669 or 1800-599-0019 (Crisis Helplines) or go to your nearest emergency room. Would you like me to help you find local crisis resources?";
    }

    // Enhanced responses based on detected emotion
    if (currentEmotion === 'sad' || currentEmotion === 'fear') {
      if (lowerMessage.includes('fine') || lowerMessage.includes('okay') || lowerMessage.includes('good')) {
        return emotionPrefix + "I hear you saying you're okay, but your expression tells me there might be more going on. It's completely fine to not be okay. Would you like to talk about what's really on your mind?";
      }
    }

    if (currentEmotion === 'angry' || currentEmotion === 'disgust') {
      return emotionPrefix + "It seems like something is bothering you. Anger and frustration are valid emotions. Would you like to talk about what's causing these feelings? Sometimes expressing them can help.";
    }

    // Stress-related responses
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
      return emotionPrefix + "It sounds like you're dealing with a lot of stress right now. That's completely understandable - college can be overwhelming. Have you tried any stress management techniques like deep breathing or taking short breaks? I can guide you through some exercises if you'd like.";
    }

    // Anxiety-related responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      return emotionPrefix + "Anxiety can feel really intense, but you're taking a positive step by reaching out. Some students find it helpful to practice grounding techniques - like naming 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. Would you like to try this together?";
    }

    // Sleep-related responses
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia')) {
      return emotionPrefix + "Sleep issues are really common among students. Poor sleep can affect everything from mood to academic performance. Have you tried establishing a consistent bedtime routine? I can share some sleep hygiene tips that many students find helpful.";
    }

    // Academic pressure responses
    if (lowerMessage.includes('exam') || lowerMessage.includes('study') || lowerMessage.includes('grade') || lowerMessage.includes('academic')) {
      return emotionPrefix + "Academic pressure is one of the biggest stressors for students. Remember that your worth isn't defined by your grades. Have you considered breaking down your study tasks into smaller, manageable chunks? Sometimes the workload feels less overwhelming when we tackle it piece by piece.";
    }

    // Loneliness responses
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('isolated')) {
      return emotionPrefix + "Feeling lonely is more common than you might think, especially in college. Many students experience this, even when surrounded by people. Have you considered joining any clubs or study groups? Sometimes connecting over shared interests can help build meaningful relationships.";
    }

    // Depression-related responses
    if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
      return emotionPrefix + "I hear that you're going through a difficult time. Depression can make everything feel harder, but please know that these feelings can improve with support. Have you considered speaking with a counselor? Sometimes talking to a professional can provide new perspectives and coping strategies.";
    }

    // Positive responses - with emotion awareness
    if (lowerMessage.includes('good') || lowerMessage.includes('better') || lowerMessage.includes('fine') || lowerMessage.includes('okay')) {
      if (currentEmotion === 'happy' || currentEmotion === 'calm') {
        return emotionPrefix + "I'm glad to hear you're doing well, and it shows! It's great that you're checking in. Even when things are going okay, it's important to maintain your mental health. Is there anything specific you'd like to talk about or any resources you'd like to explore?";
      }
      return emotionPrefix + "I'm glad to hear you're doing okay. Is there anything specific you'd like to talk about or any resources you'd like to explore?";
    }

    // Default responses with emotion context
    const defaultResponses = [
      emotionPrefix + "Thank you for sharing that with me. Can you tell me more about what you're experiencing?",
      emotionPrefix + "I'm here to listen and support you. What's been on your mind lately?",
      emotionPrefix + "It takes courage to reach out. How can I best support you today?",
      emotionPrefix + "I appreciate you opening up. What would be most helpful for you right now?",
      emotionPrefix + "Your feelings are valid. Would you like to explore some coping strategies together?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    const currentMessage = inputText;
    const currentEmotionState = detectedEmotion;

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(currentMessage, currentEmotionState),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Emergency Banner */}
      <AnimatePresence>
        {showEmergencyBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-destructive text-destructive-foreground p-4"
          >
            <div className="max-w-[120rem] mx-auto px-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <p className="font-heading font-bold">Crisis Support Available 24/7</p>
                  <p className="font-paragraph text-sm">If you're in immediate danger, please call 022 2754 6669 or 1800-599-0019 or go to your nearest emergency room.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="tel:02227546669"
                  className="bg-white text-destructive px-4 py-2 rounded-lg font-paragraph font-medium hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 022 2754 6669</span>
                </a>
                <a
                  href="tel:18005990019"
                  className="bg-white text-destructive px-4 py-2 rounded-lg font-paragraph font-medium hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 1800-599-0019</span>
                </a>
                <button
                  onClick={() => setShowEmergencyBanner(false)}
                  className="text-destructive-foreground hover:text-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[120rem] mx-auto px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            AI Chat Support
          </h1>
          <p className="text-lg font-paragraph text-gray-600 max-w-2xl mx-auto">
            Get immediate, confidential support through our AI chatbot. This is a safe space to share your thoughts and feelings.
          </p>
        </div>

        {/* Camera Preview Panel */}
        <AnimatePresence>
          {isCameraOn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto mb-4"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start space-x-4">
                  {/* Video Preview */}
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-48 h-36 object-cover rounded-xl bg-gray-900"
                    />
                    {/* Hidden canvas for frame capture */}
                    <canvas ref={canvasRef} className="hidden" />
                    <button
                      onClick={toggleCamera}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {isAnalyzing && (
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Analyzing...
                      </div>
                    )}
                  </div>

                  {/* Emotion Detection Display */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-bold text-foreground">Emotion Detection</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        backendStatus === 'connected'
                          ? 'bg-green-100 text-green-700'
                          : backendStatus === 'error'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {backendStatus === 'connected' ? 'AI Connected' :
                         backendStatus === 'error' ? 'AI Offline' : 'Connecting...'}
                      </span>
                    </div>
                    <p className="font-paragraph text-sm text-gray-600 mb-3">
                      {backendStatus === 'connected'
                        ? 'AI is analyzing your facial expressions to better understand how you\'re feeling.'
                        : 'Start the Python backend to enable real emotion detection.'}
                    </p>
                    {detectedEmotion && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full"
                      >
                        <span className="text-2xl">
                          {detectedEmotion === 'happy' && '😊'}
                          {detectedEmotion === 'sad' && '😢'}
                          {detectedEmotion === 'angry' && '😠'}
                          {detectedEmotion === 'fear' && '😨'}
                          {detectedEmotion === 'surprise' && '😲'}
                          {detectedEmotion === 'disgust' && '🤢'}
                          {detectedEmotion === 'neutral' && '😐'}
                        </span>
                        <span className="font-paragraph font-medium capitalize">{detectedEmotion}</span>
                        {emotionConfidence && (
                          <span className="text-xs text-gray-500">
                            ({Math.round(emotionConfidence)}%)
                          </span>
                        )}
                      </motion.div>
                    )}
                    {!detectedEmotion && backendStatus === 'connected' && (
                      <p className="text-sm text-gray-400">Looking for face...</p>
                    )}
                    <p className="font-paragraph text-xs text-gray-400 mt-2">
                      Your privacy is protected. Video is processed locally and not stored.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Chat Messages */}
          <div ref={messagesContainerRef} className="h-[600px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-gray-50 text-foreground mr-4'
                  }`}
                >
                  <p className="font-paragraph">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.isUser ? 'text-primary-foreground/70' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-100 p-6">
            {/* Listening indicator */}
            <AnimatePresence>
              {isListening && transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <p className="font-paragraph text-sm text-gray-600">
                    <span className="text-primary font-medium">Listening: </span>
                    {transcript}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex space-x-3">
              {/* Camera Toggle Button */}
              <button
                onClick={toggleCamera}
                className={`p-4 rounded-xl transition-colors ${
                  isCameraOn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera for emotion detection'}
              >
                {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </button>

              {/* Mic Toggle Button */}
              <button
                onClick={toggleMic}
                className={`p-4 rounded-xl transition-colors ${
                  isMicOn
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isMicOn ? 'Turn off microphone' : 'Turn on microphone for speech-to-text'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isMicOn ? "Speak or type your message..." : "Type your message here... Press Enter to send"}
                className="flex-1 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph"
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-primary text-primary-foreground p-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                {isCameraOn && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Camera active</span>
                  </span>
                )}
                {isMicOn && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span>Listening...</span>
                  </span>
                )}
              </div>
              <p className="font-paragraph text-sm text-gray-500">
                For emergencies, call 022 2754 6669 or 1800-599-0019
              </p>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="font-heading font-bold text-foreground mb-2">Crisis Helplines</h3>
            <p className="font-paragraph text-sm text-gray-600 mb-3">24/7 crisis support</p>
            <div className="space-y-2">
              <a
                href="tel:02227546669"
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-destructive/90 transition-colors inline-flex items-center space-x-2 w-full justify-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call 02227546669</span>
              </a>
              <a
                href="tel:18005990019"
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-destructive/90 transition-colors inline-flex items-center space-x-2 w-full justify-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call 18005990019</span>
              </a>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="font-heading font-bold text-foreground mb-2">Campus Counseling</h3>
            <p className="font-paragraph text-sm text-gray-600 mb-3">Professional support</p>
            <a
              href="/booking"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-primary/90 transition-colors"
            >
              Book Appointment
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="font-heading font-bold text-foreground mb-2">Peer Support</h3>
            <p className="font-paragraph text-sm text-gray-600 mb-3">Connect with others</p>
            <a
              href="/forum"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-primary/90 transition-colors"
            >
              Join Forum
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}