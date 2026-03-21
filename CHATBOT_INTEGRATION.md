# Chatbot Integration Guide

## Quick Start: Add to Existing ChatPage

### Option 1: Replace Entire ChatPage (Simplest)

Create a new file: `/src/components/pages/ChatPage.tsx`

```typescript
import React from "react";
import { ChatbotContainer } from "@/components/Chatbot";

/**
 * Chat Page - Main chatbot interface
 *
 * This page renders the new AI-powered mental health support chatbot
 * with emotion-aware theming and safety features.
 */
export default function ChatPage() {
  const handleEmotionChange = (emotion: string) => {
    // Optional: Track emotion for analytics
    console.log("User emotion detected:", emotion);
  };

  const handleCrisisDetected = () => {
    // Optional: Trigger additional actions on crisis
    console.log("⚠️ Crisis detected - additional support activated");
    // Could send notification to admin, trigger alert, etc.
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Chatbot Container */}
      <div className="h-full max-w-2xl mx-auto">
        <ChatbotContainer
          onEmotionChange={handleEmotionChange}
          onCrisisDetected={handleCrisisDetected}
        />
      </div>
    </div>
  );
}
```

### Option 2: Preserve Existing Page Structure (Keep Sidebar, Add Chatbot)

If your existing ChatPage has navigation or other content:

```typescript
import React, { useState } from "react";
import { ChatbotContainer } from "@/components/Chatbot";
import Sidebar from "@/components/Sidebar"; // Your existing component

export default function ChatPage() {
  const [currentEmotion, setCurrentEmotion] = useState<string>("NEUTRAL");
  const [showCrisisAlert, setShowCrisisAlert] = useState<boolean>(false);

  return (
    <div className="flex h-screen">
      {/* Existing Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Optional: Crisis Alert Banner */}
        {showCrisisAlert && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4">
            <p className="text-red-800 font-bold">
              🚨 Crisis support resources have been provided
            </p>
          </div>
        )}

        {/* Chatbot Container */}
        <div className="flex-1 overflow-hidden">
          <ChatbotContainer
            onEmotionChange={setCurrentEmotion}
            onCrisisDetected={() => setShowCrisisAlert(true)}
          />
        </div>

        {/* Optional: Emotion Indicator Footer */}
        <div className="px-6 py-3 bg-white border-t text-sm text-gray-600">
          Current mood: {currentEmotion}
        </div>
      </div>
    </div>
  );
}
```

### Option 3: Modal/Drawer Version

For a floating chatbot widget:

```typescript
import React, { useState } from "react";
import { ChatbotContainer } from "@/components/Chatbot";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatBot Drawer() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-4 right-4 w-96 h-96 rounded-lg shadow-2xl z-50"
        >
          <ChatbotContainer
            onCrisisDetected={() => {
              // Play alert sound, trigger notification, etc.
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Backend Configuration for Your Project

### 1. Ensure Backend is Running

```bash
cd chatbot-backend
export OPENAI_API_KEY=sk-your-key-here
mvn spring-boot:run
```

Server starts on: `http://localhost:8080/api`

### 2. Verify API Connectivity

Frontend automatically calls: `http://localhost:8080/api/chat/message`

Test:
```bash
curl http://localhost:8080/api/health
```

### 3. Add to your Astro configuration if needed

In `astro.config.mjs`, ensure your dev server proxy is set up:

```javascript
export default defineConfig({
  // ... other config
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  },
});
```

---

## Styling & Customization

### Theme Colors

All colors are automatically applied from the backend based on detected emotion. No manual configuration needed!

But you can override if desired:

```typescript
// In your component
const customTheme = {
  backgroundColor: "#custom-color",
  accentColor: "#custom-color",
  textColor: "#custom-color",
};
```

### Tailwind CSS

The chatbot uses Tailwind CSS classes. Ensure Tailwind is configured in your project (it already is).

### Custom Animations

To modify animations, edit `/src/hooks/useEmotionTheme.ts`:

```typescript
@keyframes breathing {
  0% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.8; transform: scale(1); }
}
```

---

## Integrating with Existing Features

### With Your Member System

```typescript
import { useMemberContext } from "@/integrations/members/providers/MemberProvider";
import { ChatbotContainer } from "@/components/Chatbot";

export default function ChatPage() {
  const { currentMember } = useMemberContext();

  return (
    <ChatbotContainer
      key={currentMember?.id}  // Force new session on user change
      onEmotionChange={(emotion) => {
        // Track for user analytics
        console.log(`${currentMember?.name} detected emotion: ${emotion}`);
      }}
    />
  );
}
```

### With Resources/Counselor Booking

```typescript
const handleCrisisDetected = () => {
  // Automatically show counselor booking
  navigation.navigate("/booking");
};

<ChatbotContainer onCrisisDetected={handleCrisisDetected} />
```

### With Forum/Community

```typescript
const handleEmotionChange = (emotion: string) => {
  // Show relevant community posts for detected emotion
  filterForumPosts(emotion);
};
```

---

## Conversation Management

### Starting with Initial Message

```typescript
<ChatbotContainer
  initialMessage="Tell me how you've been feeling lately"
/>
```

### Clearing Chat History

The `useChatbot()` hook returns a `clearMessages()` function:

```typescript
import { useChatbot } from "@/hooks/useChatbot";

const ChatbotPage = () => {
  const { clearMessages } = useChatbot();

  return (
    <>
      <ChatbotContainer />
      <button onClick={clearMessages}>Start New Conversation</button>
    </>
  );
};
```

---

## Error Handling

The chatbot handles errors gracefully:

1. **Network Error**: Shows fallback message
2. **API Error**: Displays error alert with retry option
3. **Validation Error**: Prevents invalid input submission

Check browser console (F12) for detailed error information.

---

## Performance Optimization

### Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const ChatbotContainer = dynamic(
  () => import("@/components/Chatbot").then(mod => mod.ChatbotContainer),
  {
    loading: () => <div>Loading chatbot...</div>,
    ssr: false,
  }
);
```

### Memo for Performance

```typescript
const ChatPage = React.memo(function ChatPage() {
  return <ChatbotContainer />;
});
```

---

## Testing Integration

### Unit Test Example

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatbotContainer } from "@/components/Chatbot";

test("chatbot sends message to backend", async () => {
  render(<ChatbotContainer />);

  const input = screen.getByPlaceholderText(/share what's on your mind/i);
  await userEvent.type(input, "I feel sad");
  await userEvent.keyboard("{Shift>}{Enter}");

  // Wait for API call
  await screen.findByText(/that sounds really difficult/i);
});
```

### Integration Test

```bash
# 1. Start backend
cd chatbot-backend && mvn spring-boot:run

# 2. In another terminal, run frontend tests
npm run test:e2e
```

---

## Deployment

### Frontend (Vercel/Netlify)

Ensure environment variable:
```
VITE_CHATBOT_API_URL=https://your-backend-domain.com/api
```

Update `/src/hooks/useChatbot.ts` API URL accordingly.

### Backend (Docker)

Create `Dockerfile`:
```dockerfile
FROM maven:3.8.1-openjdk-17 as build
WORKDIR /app
COPY . .
RUN mvn clean package

FROM openjdk:17-alpine
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t saarthi-chatbot .
docker run -e OPENAI_API_KEY=sk-your-key -p 8080:8080 saarthi-chatbot
```

---

## Troubleshooting Integration

### "Cannot find module '@/components/Chatbot'"
- Ensure path alias `@/` is configured in `tsconfig.json`
- Check files exist in `/src/components/Chatbot/`

### "API not found"
- Backend must be running: `mvn spring-boot:run`
- Check port 8080 is not blocked
- Verify CORS in `application.properties`

### "Emotion not changing"
- Check backend logs for emotion detection
- Try messages with strong emotional keywords
- Ensure backend is restarted after changes

### "Styles not applying"
- Clear browser cache: Ctrl+Shift+Delete
- Restart dev server: `npm run dev`
- Check Tailwind is configured

---

## Next Steps

1. ✅ Backend: Set up Java Spring Boot server
2. ✅ Frontend: Add ChatbotContainer component
3. ✅ API: Verify /api/chat/message works
4. ✅ Testing: Test emotion detection and crisis response
5. 📋 Analytics: Add event tracking for emotions
6. 📋 Database: Persist conversations (post-MVP)
7. 📋 Admin: Create dashboard for monitoring
8. 📋 Counselor: Integrate professional resources

---

**Questions?** Check CHATBOT_SETUP.md for full documentation.
