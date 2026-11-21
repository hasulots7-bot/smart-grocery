# Smart Grocery (மளிகைப் பட்டியல்)

A modern, real-time collaborative grocery shopping and household pantry manager built with React, Vite, Capacitor, and an Express WebSocket synchronization server.

---

## Features

- **Real-Time Family Sync**: Instant item updates across multiple devices via WebSocket and unique Family Sync codes.
- **Bilingual Interface**: Full English and Tamil (தமிழ்) localization with grocery names and categories.
- **PWA & Mobile Native**: Built for web, PWA (Progressive Web App), and Android using Capacitor.
- **Smart Categorization & Pricing**: Track quantities, units, categories, and estimated/actual costs.
- **Offline & Local Storage Support**: Seamless offline functionality with automatic synchronization upon reconnection.

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vite.dev/), [Lucide React Icons](https://lucide.dev/), Canvas Confetti
- **Styling**: Modern responsive CSS with custom theming
- **Backend**: Node.js, [Express](https://expressjs.com/), [ws (WebSocket)](https://github.com/websockets/ws)
- **Mobile Container**: [Capacitor](https://capacitorjs.com/) for Android
- **Linter**: [Oxlint](https://oxc.rs/)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 1. Installation

```bash
npm install
```

### 2. Running the Backend Server

Start the local API and WebSocket synchronization server:

```bash
node server.js
```

The server will listen on port `5000` (e.g., `http://localhost:5000`).

### 3. Running the Frontend Development Server

In a separate terminal, launch the Vite dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Building & Linting

### Linting Code

Run the Oxlint linter to check for syntax and style issues:

```bash
npm run lint
```

### Production Web Build

Compile the React frontend into static assets in `dist/`:

```bash
npm run build
```

---

## Mobile Build (Android / Capacitor)

1. Build the web assets:
   ```bash
   npm run build
   ```
2. Sync the compiled assets with Capacitor:
   ```bash
   npx cap sync android
   ```
3. Open the Android project in Android Studio or build the APK:
   ```bash
   npx cap open android
   ```
