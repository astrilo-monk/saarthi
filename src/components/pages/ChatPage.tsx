import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const emergencyKeywords = ['help', 'suicidal', 'crisis', 'suicide', 'kill myself', 'end it all', 'hurt myself', 'self harm'];

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for emergency keywords
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      setShowEmergencyBanner(true);
      return "I'm concerned about what you're sharing. Please know that you're not alone, and there are people who want to help. If you're in immediate danger, please call 022 2754 6669 or 1800-599-0019 (Crisis Helplines) or go to your nearest emergency room. Would you like me to help you find local crisis resources?";
    }

    // Stress-related responses
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
      return "It sounds like you're dealing with a lot of stress right now. That's completely understandable - college can be overwhelming. Have you tried any stress management techniques like deep breathing or taking short breaks? I can guide you through some exercises if you'd like.";
    }

    // Anxiety-related responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
      return "Anxiety can feel really intense, but you're taking a positive step by reaching out. Some students find it helpful to practice grounding techniques - like naming 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. Would you like to try this together?";
    }

    // Sleep-related responses
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia')) {
      return "Sleep issues are really common among students. Poor sleep can affect everything from mood to academic performance. Have you tried establishing a consistent bedtime routine? I can share some sleep hygiene tips that many students find helpful.";
    }

    // Academic pressure responses
    if (lowerMessage.includes('exam') || lowerMessage.includes('study') || lowerMessage.includes('grade') || lowerMessage.includes('academic')) {
      return "Academic pressure is one of the biggest stressors for students. Remember that your worth isn't defined by your grades. Have you considered breaking down your study tasks into smaller, manageable chunks? Sometimes the workload feels less overwhelming when we tackle it piece by piece.";
    }

    // Loneliness responses
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('isolated')) {
      return "Feeling lonely is more common than you might think, especially in college. Many students experience this, even when surrounded by people. Have you considered joining any clubs or study groups? Sometimes connecting over shared interests can help build meaningful relationships.";
    }

    // Depression-related responses
    if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
      return "I hear that you're going through a difficult time. Depression can make everything feel harder, but please know that these feelings can improve with support. Have you considered speaking with a counselor? Sometimes talking to a professional can provide new perspectives and coping strategies.";
    }

    // Positive responses
    if (lowerMessage.includes('good') || lowerMessage.includes('better') || lowerMessage.includes('fine') || lowerMessage.includes('okay')) {
      return "I'm glad to hear you're doing well! It's great that you're checking in. Even when things are going okay, it's important to maintain your mental health. Is there anything specific you'd like to talk about or any resources you'd like to explore?";
    }

    // Default responses
    const defaultResponses = [
      "Thank you for sharing that with me. Can you tell me more about what you're experiencing?",
      "I'm here to listen and support you. What's been on your mind lately?",
      "It takes courage to reach out. How can I best support you today?",
      "I appreciate you opening up. What would be most helpful for you right now?",
      "Your feelings are valid. Would you like to explore some coping strategies together?"
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

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
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

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-4">
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
            <div className="flex space-x-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... Press Enter to send"
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
            
            <div className="mt-4 text-center">
              <p className="font-paragraph text-sm text-gray-500">
                This is an AI chatbot for support and resources. For emergencies, call 022 2754 6669 or 1800-599-0019 or your local emergency services.
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
                <span>Call 022 2754 6669</span>
              </a>
              <a
                href="tel:18005990019"
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-destructive/90 transition-colors inline-flex items-center space-x-2 w-full justify-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call 1800-599-0019</span>
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