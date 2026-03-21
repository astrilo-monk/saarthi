import { ChatbotContainer } from '@/components/Chatbot';

export default function ChatPage() {
  return (
    <div className="w-full h-screen bg-white overflow-hidden fixed inset-0">
      <div className="h-full max-w-4xl mx-auto pt-4 pb-4 px-4">
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