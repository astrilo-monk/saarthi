import { ChatbotContainer } from '@/components/Chatbot';

export default function ChatPage() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4" style={{ height: 'calc(100vh - 80px)' }}>
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