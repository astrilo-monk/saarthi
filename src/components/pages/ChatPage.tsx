import { ChatbotContainer } from '@/components/Chatbot';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
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