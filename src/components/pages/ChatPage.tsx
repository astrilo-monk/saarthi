import { ChatbotContainer } from '@/components/Chatbot';

export default function ChatPage() {
  return (
    <div className="w-full bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto min-h-96">
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