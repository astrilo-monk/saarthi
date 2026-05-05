# Saarthi - Campus Mental Health Support Platform

A web-based mental health support platform designed specifically for college students. Saarthi addresses the growing need for accessible, stigma-free mental health resources within academic environments by providing a suite of digital tools that students can use privately, anonymously, and at any time.

## Table of Contents

- [Features](#features)
- [Recent Updates](#recent-updates)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Upcoming Features](#upcoming-features)
- [Limitations](#limitations)
- [License](#license)

## Features

### AI Chat Support
- 24/7 conversational support with context-aware responses covering stress, anxiety, sleep issues, academic pressure, loneliness, and depression.
- **Real-time crisis detection** that scans messages for emergency keywords and immediately surfaces helpline numbers (iCall, Vandrevala Foundation) and campus counseling contacts.
- No messages are stored permanently — sessions are discarded after use.

### Counselor Booking System
- Browse profiles of licensed counselors with specialties including anxiety & stress management, depression & mood disorders, relationship & social skills, and academic performance.
- Book sessions with date, time slot, session mode (online video or in-person), and urgency level selection.
- **Anonymous ID system** — students are assigned a random booking reference so their identity is never disclosed to the counselor.

### Mental Health Resource Hub
- Curated collection of articles, videos, audio guides, meditation exercises, and self-help toolkits.
- **Multi-language filtering** (English, Hindi, Gujarati, Tamil, Bengali) and category-based browsing.
- Quick-access tools for guided breathing, relaxation audio, and self-help guides.

### Peer Support Forum
- Anonymous discussion threads organized by category: Academic Stress, Relationships & Social Life, Mental Health Awareness, Self-Care & Wellness, and Career & Future Anxiety.
- Post and reply with auto-assigned anonymous aliases — no real names are ever shown.

### Mindful Garden (Gamified Wellness)
- Grow a virtual plant from seedling to mighty tree by completing daily wellness tasks such as deep breathing, gratitude journaling, reading mental health articles, mindful moments, and physical activity.
- XP-based progression system with 5 growth stages, streak tracking, and level-up celebrations.
- Progress persists locally per user.

### Admin Dashboard
- Aggregated analytics with KPI cards (total users, active users, sessions, emergency alerts).
- Charts for daily active users, session type distribution, top issues breakdown, and weekly trends.
- Emergency alert monitoring table with severity levels and action buttons.

### User Profiles
- View account information, privacy settings, and activity summary.
- Anonymous mode and data encryption indicators.

## Recent Updates

### Chatbot Infrastructure Overhaul (March 2026)

**Migration to Local LLM**
- Replaced cloud-based OpenAI API with locally-hosted Ollama for cost-free, privacy-first AI inference
- Currently running Phi model (1.6GB, fast inference on consumer hardware)
- Supports multiple models: Mistral, Llama2, Neural-Chat with simple configuration swap
- No API keys required, complete data privacy with local processing

**Java Spring Boot Backend**
- Complete backend rewrite from Node.js to Java 17 + Spring Boot 3.2
- RESTful API architecture with proper MVC pattern separation
- Robust error handling, retry logic, and fallback responses
- Health check endpoints and comprehensive logging
- Configurable via `application.properties` for easy deployment customization

**Enhanced Chatbot Features**
- **Emotion-aware theming**: Background colors and UI elements dynamically adapt based on detected emotional state (neutral, anxious, critical, etc.)
- **Real-time crisis detection**: Advanced pattern matching for self-harm indicators with immediate helpline surfacing (AASRA, iCall, Vandrevala Foundation)
- **Camera integration**: Optional facial emotion detection using DeepFace API (Python backend on port 8000)
- **Microphone support**: WebAPI-based speech-to-text for hands-free interaction
- **Conversation memory**: Session-based chat history with configurable limits
- **Response validation**: Safety checks to prevent medical advice and ensure appropriate boundaries

**UI/UX Redesign**
- Claude-inspired minimal, clean interface with light green calming theme
- Message bubbles with timestamps and emotion labels
- Auto-scrolling chat container (page stays fixed)
- Immediate user message display with loading indicators
- Camera/mic controls on left, send button on right (intuitive layout)
- Fully responsive design with smooth animations via Framer Motion

**Configuration & Deployment**
- Easily adjustable response length (currently 2000 characters, 512 tokens)
- Configurable temperature, top-p, top-k for LLM behavior tuning
- Simple model switching via single property change
- Maven-based build system for reliable Java compilation
- Ready for production deployment with environment-based configs

**Technical Improvements**
- Comprehensive input validation and sanitization
- Exponential backoff retry mechanism for API resilience
- Session timeout management (30 minutes default)
- Maximum conversation history limit (10 messages default)
- Proper CORS configuration for frontend-backend communication
- Structured logging with debug levels for troubleshooting

### What Changed Technically

| Component | Before | After |
|-----------|--------|-------|
| **LLM Provider** | OpenAI GPT-3.5 (cloud API) | Ollama Phi/Mistral (local) |
| **Backend Language** | Node.js/Express | Java 17 + Spring Boot 3.2 |
| **Response Limit** | 150 tokens (~500 chars) | 512 tokens (~2000 chars) |
| **Crisis Detection** | Basic keyword matching | Multi-pattern regex with severity levels |
| **Emotion Detection** | None | DeepFace API integration (optional) |
| **UI Design** | Standard chat boxes | Minimal Claude-style interface |
| **Theming** | Static colors | Dynamic emotion-aware theming |
| **Input Methods** | Text only | Text + Voice + Camera |
| **API Cost** | ~$0.002 per message | $0 (fully local) |



## Tech Stack

| Layer | Technology |
|---|---|
| Meta-framework | [Astro 5](https://astro.build/) with SSR (`output: "server"`) |
| UI Library | [React 18](https://react.dev/) via `client:only="react"` directive |
| Routing | [React Router DOM 7](https://reactrouter.com/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Component Library | [Radix UI](https://www.radix-ui.com/) (25+ primitives) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| State Management | [Zustand](https://zustand-demo.pmnd.rs/) |
| Forms & Validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| Maps | [React Leaflet](https://react-leaflet.js.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| **Backend API** | [Java 17](https://www.oracle.com/java/) + [Spring Boot 3.2](https://spring.io/projects/spring-boot) |
| **LLM Runtime** | [Ollama](https://ollama.ai/) (local inference) |
| **Emotion Detection** | [FastAPI](https://fastapi.tiangolo.com/) + [DeepFace](https://github.com/serengil/deepface) (optional) |
| Build Tool (Frontend) | [Vite 6](https://vite.dev/) |
| Build Tool (Backend) | [Maven 3](https://maven.apache.org/) |
| Deployment | [Vercel](https://vercel.com/) (frontend) + Any Java host (backend) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm
- [Java 17](https://www.oracle.com/java/technologies/downloads/) or later
- [Maven 3](https://maven.apache.org/download.cgi)
- [Ollama](https://ollama.ai/) (for AI chatbot)

### Installation

**Frontend:**
```bash
git clone <https://github.com/astrilo-monk/saarthi>
cd campus-calm-main
npm install
```

**Backend (Chatbot API):**
```bash
cd chatbot-backend
mvn clean install
```

**Ollama Setup:**
```bash
# Install Ollama from https://ollama.ai
# Pull a model (Phi recommended for speed)
ollama pull phi:latest

# Or use Mistral for better quality
ollama pull mistral:latest
```

### Run Locally

**Start Frontend:**
```bash
npm run dev
# Runs on http://localhost:4321
```

**Start Backend:**
```bash
cd chatbot-backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

**Start Ollama:**
```bash
ollama serve
# Runs on http://localhost:11434
```

### Production Build

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd chatbot-backend
mvn clean package
java -jar target/chatbot-backend-1.0.0.jar
```

## Project Structure

```
campus-calm-main/
├── public/
│   ├── data/                  # Static JSON data (counselors, resources, etc.)
│   └── images/                # Static assets
├── src/
│   ├── components/
│   │   ├── pages/             # Page-level components
│   │   │   ├── HomePage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   ├── ResourcesPage.tsx
│   │   │   ├── ForumPage.tsx
│   │   │   ├── PlantGamePage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── AdminLoginPage.tsx
│   │   ├── ui/                # Reusable UI components (Radix wrappers)
│   │   ├── Router.tsx         # Client-side SPA router
│   │   ├── Layout.tsx         # App shell layout
│   │   └── Head.tsx           # HTML head metadata
│   ├── entities/              # TypeScript data models
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── pages/
│   │   └── [...slug].astro    # Astro catch-all route (SSR entry)
│   └── styles/                # Global CSS and font definitions
├── integrations/
│   ├── cms/                   # Data fetching service (reads from /data/*.json)
│   ├── members/               # Authentication provider (localStorage-based)
│   └── errorHandlers/         # Error boundary
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## Pages & Routes

| Route | Component | Access | Description |
|---|---|---|---|
| `/` | HomePage | Public | Landing page with hero, features, testimonials |
| `/chat` | ChatPage | Public | AI chat support with crisis detection |
| `/booking` | BookingPage | Public | Browse counselors and book sessions |
| `/resources` | ResourcesPage | Public | Filterable mental health resource library |
| `/forum` | ForumPage | Public | Anonymous peer support discussions |
| `/plant-game` | PlantGamePage | Members | Gamified daily wellness tasks |
| `/profile` | ProfilePage | Members | Account info and privacy settings |
| `/admin-login` | AdminLoginPage | Public | Admin authentication |
| `/admin` | AdminPage | Admin | Analytics dashboard and alert monitoring |

## Upcoming Features

The following roadmap outlines planned enhancements as Saarthi evolves from an academic prototype into a production-grade, institutionally deployable mental health ecosystem.

### The Living World Tree (v2.0 Flagship)
The most ambitious planned upgrade transforms the Mindful Garden from a personal plant into a shared, real-time animated world visible to all logged-in users.
- A fully animated **3D-rendered World Tree** on the home screen, powered by Three.js and WebGL shaders.
- The tree's size, density, and visual richness are driven by live data — more users online means more leaves, brighter glow, and a richer canopy.
- Every fruit on the tree represents a real anonymous user currently online. Fruit types encode mood or topic (e.g., a glowing mango for exam stress, a blue berry for loneliness).
- Cosmetic tree upgrades earned through XP — golden bark, bioluminescent leaves, glowing roots — purely aesthetic, no gameplay advantage.
- Real-time fruit spawn/despawn via Socket.IO with a presence server tracking anonymised online state.

### AI Chat & Crisis Intelligence Upgrades
- Replace keyword matching with a **fine-tuned NLP classifier** trained on clinical mental health datasets (CLPsych, CSSRS-based corpora) for nuanced, context-aware crisis detection.
- **Voice-based AI chat** via Whisper API speech-to-text, removing the typing barrier for students in acute distress and benefiting users with dyslexia or motor impairments.
- **Multilingual support** across Hindi, Bengali, Urdu, and Tamil.
- Post-session AI summaries for counselors (opt-in, with explicit consent) to enable continuity of care.

### Peer Support System Upgrades
- Upgrade queue-based matching to a **vector similarity engine** — match peers by mood embedding, stated topic, and conversational style compatibility.
- **Peer Volunteer Programme**: verified student volunteers complete structured onboarding, earn badges, and are surfaced as preferred matches.
- Real-time distress indicators for moderators: typing pause detection, response latency analysis, and sudden topic shift alerts.

### Counselor Booking & Case Management
- **Smart scheduling engine** that learns counselor availability patterns and student urgency signals to auto-suggest optimal booking windows.
- Counselor analytics dashboard showing aggregated (never individual) session trends, peak demand periods, and resource utilisation rates.

### Infrastructure & Security
- **DPDP Act (India) compliance** framework with explicit consent flows, data minimisation audits, and a student-facing privacy dashboard.
- **Offline-first PWA architecture**: breathing, journaling, and mood check-in tools function without internet access.
- Kubernetes auto-scaling backend to handle exam-season demand spikes.
- End-to-end encryption for all chat sessions.
- Accessibility improvements: screen reader support, high-contrast mode, and expanded localisation.

## Limitations

- The AI chatbot now runs locally via Ollama (Phi/Mistral models). While this eliminates API costs and enhances privacy, response quality depends on the chosen model and available compute resources.
- Crisis detection has been upgraded from simple keyword matching to multi-pattern regex with severity levels, but a fine-tuned ML classifier would provide even more nuanced detection.
- Emotion detection via camera is optional and requires a separate Python FastAPI backend running DeepFace. This dependency can be removed for simplified deployment.
- Peer-to-peer matching still uses a simple first-in, first-out queue rather than compatibility scoring.
- The platform uses static JSON data files and localStorage for persistence. A production deployment would require a proper database (e.g., MongoDB, PostgreSQL) and authentication backend.
- A formal security audit and compliance verification against data protection regulations is required before any real-world institutional deployment.
- The chatbot backend (Java Spring Boot) and frontend (Astro/React) run as separate services and must both be deployed for full functionality.

## License

This project is developed for academic purposes. All rights reserved.
