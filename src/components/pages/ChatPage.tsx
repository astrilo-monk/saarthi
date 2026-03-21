import { ChatbotContainer } from '@/components/Chatbot';

export default function ChatPage() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
        <div className="w-full max-w-2xl h-full">
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
    </div>
  );
}