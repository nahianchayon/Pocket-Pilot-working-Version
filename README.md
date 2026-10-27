# PocketPilot 🚀
> **Smart Personal Finance and Expense Tracker Engineered for Students**

PocketPilot is a modern, student-focused personal finance platform designed to simplify monthly allowance budgeting, expense logging, recurring bill tracking, and financial health scoring. Built with a fast, reactive UI and backed by **Firebase Authentication** and **Google Cloud Firestore**.

![PocketPilot Preview](public/favicon.ico)

---

## ✨ Features

- **🎯 Interactive Student Landing Page**: Modern, high-converting hero section with 3D smartphone mockups, floating badges, and an interactive allowance savings calculator.
- **🎧 Audio / DJ Turntable Auth Interface**: Unique student DJ turntable aesthetic with animated vinyl records, floating coins, and responsive controls.
- **📊 Real-Time Financial Dashboard**:
  - Live monthly budget breakdown, burn rate, and daily average spending.
  - End-of-month spend pace projection.
  - Category distribution pie chart (Food, Education, Rent, Transportation, Utilities, etc.).
  - Daily spend trend area chart.
  - Student Financial Health Score (0–100) and Emergency Budget alerts.
- **💸 Expense & Income Tracking**:
  - Fast expense entry with customizable categories, notes, and dates.
  - Multiple income streams (allowances, tuition gigs, freelancing, scholarships).
  - Search, filter, and delete capabilities with immediate recalculation.
- **🔔 Recurring Bills Management**:
  - Track tuition fees, hostel rent, meal plans, WiFi, and subscriptions.
  - Due-day reminders and monthly recurring total aggregations.
- **🧠 AI Insights & Spending Patterns**:
  - Weekday spend heatmap.
  - Top category burn rate alerts and frugal living tips.
- **☁️ Cloud Persistence with Firebase**:
  - Real user authentication via Firebase Auth.
  - Live data persistence with Google Cloud Firestore documents and subcollections.
  - Zero dummy data: every new account starts with a clean slate for real user inputs.
  - Graceful local fallback for offline resilience.
- **📱 Responsive & Cross-Platform Ready**:
  - Desktop, tablet, and mobile-optimized layouts.
  - Capacitor Android configuration included for native mobile packaging.
  - Dark mode and light mode support with JSON data export.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Backend / Database**: [Firebase Auth](https://firebase.google.com/docs/auth) & [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Mobile Runtime**: [Capacitor](https://capacitorjs.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### 1. Clone the Repository

```bash
git clone https://github.com/nahianchayon/Pocket-Pilot-working-Version.git
cd Pocket-Pilot-working-Version
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

Your `.env` should look like:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be live at:
**[http://localhost:8080](http://localhost:8080)**

---

## 📁 Project Structure

```
├── public/                 # Static assets & favicons
├── src/
│   ├── components/         # Reusable UI primitives and layout shells
│   │   ├── app-shell.tsx   # Dashboard navigation and sidebar layout
│   │   ├── page-header.tsx # Uniform page header with action buttons
│   │   └── ui/             # Dialogs, dropdowns, inputs, tooltips
│   ├── lib/
│   │   ├── finance.ts      # Core finance types, category maps, math helpers
│   │   └── firebase.ts     # Firebase Auth, Firestore CRUD, and sync adapters
│   ├── routes/             # TanStack file-based router pages
│   │   ├── index.tsx       # Landing page with 3D visual showcase
│   │   ├── auth.tsx        # DJ-themed authentication (Sign Up / Sign In)
│   │   └── _authenticated/ # Protected dashboard & finance tools
│   │       ├── dashboard.tsx
│   │       ├── budget.tsx
│   │       ├── expenses.tsx
│   │       ├── income.tsx
│   │       ├── bills.tsx
│   │       ├── insights.tsx
│   │       └── settings.tsx
│   └── state/
│       └── finance-store.tsx # React Context state provider synced with Firestore
├── firestore.rules         # Cloud Firestore security rules
├── firebase.json           # Firebase CLI deployment config
├── capacitor.config.ts     # Android & iOS mobile configuration
├── vite.config.ts          # Vite build and plugin setup
└── package.json            # Scripts and dependencies
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server on `localhost:8080` |
| `npm run build` | Builds the production bundle |
| `npm run preview` | Previews the production build locally |
| `npx tsc --noEmit` | Runs full TypeScript static type checking |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
