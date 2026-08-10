# Nexora AI

A production-quality AI chat application built with React and the Google Gemini API. Inspired by the Gemini/ChatGPT interface pattern, built from scratch with its own visual identity, clean component architecture, and real streaming responses (no fake typing animation — the "typing effect" is the actual token stream from the API).

![License](https://img.shields.io/badge/license-MIT-blue) ![React](https://img.shields.io/badge/React-19-61DAFB) ![Vite](https://img.shields.io/badge/Vite-7-646CFF)

---

## Features

- **Real-time streaming responses** from Gemini, rendered as they arrive (true streaming, not a simulated typewriter over a completed response)
- **Full conversation history** — multiple chats, stored in `localStorage`, restored on reload
- **Markdown rendering** — headings, bold, lists, tables, inline code, and fenced code blocks with a "Copy code" button
- **Collapsible sidebar** with recent chats, that becomes a slide-in drawer on mobile
- **Dark / light theme**, persisted across sessions, respects system preference on first load
- **Stop Generation** via `AbortController`
- **Copy response to clipboard** with inline confirmation
- **Clear chat** with a confirm-before-delete safety step
- **Friendly error handling** for invalid keys, rate limits, network failures, and empty prompts
- **Fully responsive** — desktop, tablet, and mobile layouts

## Tech Stack

React 19 · Vite · JavaScript (no TypeScript) · Plain CSS (no Tailwind) · `@google/genai` (Gemini SDK) · `react-markdown` + `remark-gfm` · `lucide-react`

---

## Project Structure

```
nexora-ai/
├── src/
│   ├── components/
│   │   ├── Sidebar/         # Collapsible nav + chat history
│   │   ├── Main/             # Header, welcome screen, message list
│   │   ├── ChatMessage/      # Single message bubble + markdown rendering
│   │   ├── PromptCard/       # Home screen suggestion cards
│   │   ├── ChatInput/        # Auto-resizing textarea + send/stop button
│   │   ├── ThemeToggle/      # Light/dark switch
│   │   └── CodeBlock/        # Syntax-styled code block with copy button
│   ├── context/
│   │   └── ChatContext.jsx   # Global state: conversations, theme, streaming
│   ├── services/
│   │   └── geminiService.js  # All Gemini API calls live here, isolated from UI
│   ├── App.jsx / App.css
│   ├── main.jsx
│   └── index.css             # Design tokens (colors, type, spacing) + theme variables
├── .env.example
├── .gitignore
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Gemini API key

Get a free key from [Google AI Studio](https://aistudio.google.com/apikey), then:

```bash
cp .env.example .env
```

Open `.env` and paste your key:

```
VITE_GEMINI_API_KEY=your_actual_key_here
```

> ⚠️ **Never commit your real `.env` file.** It's already excluded in `.gitignore`. Only `.env.example` (with a placeholder) should go to GitHub.

### 3. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

---

## Deployment

The app is a static Vite build, so it deploys anywhere that serves static files.

### Vercel (recommended)
```bash
npm install -g vercel
vercel
```
In the Vercel dashboard, add `VITE_GEMINI_API_KEY` under **Project Settings → Environment Variables**, then redeploy.

### Netlify
```bash
npm run build
# Drag-and-drop the generated dist/ folder into Netlify,
# or connect the GitHub repo and set:
#   Build command: npm run build
#   Publish directory: dist
```
Add `VITE_GEMINI_API_KEY` under **Site settings → Environment variables**.

### GitHub Pages
```bash
npm install -D gh-pages
# add "homepage" and a "deploy" script to package.json, then:
npm run build
npx gh-pages -d dist
```

> Because this key is a Vite `VITE_` variable, it's bundled into the client JS. That's acceptable for a portfolio demo, but for a real production app you'd proxy Gemini calls through a backend so the key never reaches the browser.

---

## GitHub Upload Commands

```bash
git init
git add .
git commit -m "Initial commit: Nexora AI"
git branch -M main
git remote add origin https://github.com/<your-username>/nexora-ai.git
git push -u origin main
```

---

## Resume Material

### Project description

> **Nexora AI** — A responsive AI chat application built with React and the Google Gemini API, featuring real-time streaming responses, persistent conversation history, markdown/code rendering, and dark/light theming. Architected with reusable components and centralized state via the Context API.

### Resume bullet points

- Built a full-featured AI chat application in React, integrating the Google Gemini API with real-time streamed responses using async generators and `AbortController` for cancellable requests.
- Designed a reusable component architecture (7+ components) with centralized state management via the Context API, eliminating prop drilling across a multi-view chat interface.
- Implemented persistent conversation history and theme preferences using `localStorage`, restoring full application state on reload.
- Built a custom markdown rendering pipeline (`react-markdown` + `remark-gfm`) supporting tables, code blocks with syntax-aware styling, and one-click copy functionality.
- Developed a fully responsive, accessible UI (keyboard focus states, `prefers-reduced-motion` support) from scratch in plain CSS, including a collapsible sidebar that adapts to a mobile drawer pattern.

### Skills / technologies demonstrated

React (functional components, hooks: `useState`, `useEffect`, `useContext`, `useRef`, `useCallback`), Context API for global state, REST/streaming API integration, async/await, error handling & UX for failure states, `localStorage` persistence, responsive CSS (Flexbox, Grid, media queries), component composition, controlled forms, Git/GitHub workflow.

---

## Interview Explanation

**"Walk me through this project."**

"It's a chat interface for Google's Gemini API, built to demonstrate real-world React patterns rather than a toy example. The state lives in a `ChatContext` that wraps the whole app — it owns the list of conversations, which one is active, whether a response is currently streaming, and the theme. When a user sends a prompt, `sendMessage` in the context creates (or appends to) a conversation, then calls a service function that opens a stream from the Gemini SDK. As chunks arrive, I update the last message in state incrementally, so React re-renders the growing text — that's what gives the 'typing effect' without faking it with `setTimeout`. Everything API-related is isolated in `geminiService.js`, so the UI layer never touches the SDK directly, which made it easy to add structured error handling — a custom `GeminiServiceError` with a `code` property so the UI can react differently to a bad key versus a rate limit versus being offline."

## Common Interview Questions

**Q: Why Context API instead of Redux?**
A: The state shape is simple enough (a list of conversations, an active ID, a couple of flags) that Redux's boilerplate wouldn't pay for itself. Context + `useState`/`useCallback` keeps it in one readable file. I'd reach for Redux or Zustand if the state graph got more complex or needed middleware (logging, undo/redo, etc.).

**Q: How does the streaming actually work?**
A: The Gemini SDK's `generateContentStream` returns an async iterable. I `for await` over it, and on each chunk call a callback that appends the new text to the last message in the conversations array. Because that array is React state, each chunk triggers a re-render of just that message.

**Q: How do you handle the API key securely?**
A: It's read from an environment variable (`VITE_GEMINI_API_KEY`) at build time and never hardcoded or logged. That said, since it's a Vite client variable, it does end up in the shipped JS bundle — I call that out explicitly as a limitation of a purely front-end demo. A production version would route requests through a backend that holds the key server-side.

**Q: How would you scale this to support more than one AI provider?**
A: Keep the `geminiService.js` interface (`streamGeminiResponse(history, prompt, onChunk, signal)`) as the contract, and add sibling service files (`openaiService.js`, etc.) behind the same shape. The context layer wouldn't need to change.

**Q: What would you improve with more time?**
A: Code-splitting (the bundle is a bit large from `react-markdown`'s dependency tree), a real backend proxy for the API key, message editing/regeneration, and virtualizing the message list for very long conversations.

---

## License

MIT — free to use for your own portfolio.
