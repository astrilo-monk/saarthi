# Saarthi - Campus Mental Health Support Platform

A web-based mental health support platform designed specifically for college students. Saarthi addresses the growing need for accessible, stigma-free mental health resources within academic environments by providing a suite of digital tools that students can use privately, anonymously, and at any time.

## Table of Contents

- [Features](#features)
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
| Build Tool | [Vite 6](https://vite.dev/) |
| Deployment | [Vercel](https://vercel.com/) (or any Node.js host) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm

### Installation

```bash
git clone <https://github.com/astrilo-monk/saarthi>
cd campus-calm-main
npm install
```

### Run Locally

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
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

- The AI chat currently uses a template-based response engine. Integration with a production LLM (Gemini, GPT-4) would significantly improve response quality and contextual depth.
- Emergency keyword detection relies on exact pattern matching; a fine-tuned classifier would be more robust.
- Peer-to-peer matching uses a simple first-in, first-out queue rather than compatibility scoring.
- The platform uses static JSON data files and localStorage for persistence. A production deployment would require a proper database (e.g., MongoDB, PostgreSQL) and authentication backend.
- A formal security audit and compliance verification against data protection regulations is required before any real-world institutional deployment.

## License

This project is developed for academic purposes. All rights reserved.
