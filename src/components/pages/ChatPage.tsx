import { ChatbotContainer } from '@/components/Chatbot';

export default function ChatPage() {
  return (
    <div className="w-full h-screen bg-white">
      <div className="h-full max-w-4xl mx-auto">
        <ChatbotContainer
          onEmotionChange={(emotion) => {
            console.log('Emotion detected:', emotion);
          }}
          onCrisisDetected={() => {
            console.log('Crisis detected - showing emergency resources');
          }}
        />
      </div>
    </div>
  );
}