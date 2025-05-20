# Rental Bot Demo

A conversational AI-powered rental marketplace that helps users find and rent various items like cameras, drones, and gaming consoles. The application features a chat interface where users can naturally describe what they're looking for and get relevant rental suggestions.

## Tech Stack

- **Backend**: Cloudflare Workers with Hono.js
- **Frontend**: React + Vite
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **AI**: Vercel AI SDK (Gemini-2.0-flash-lite)
- **Styling**: Tailwind CSS

## Setup & Installation

### Backend Setup

1. Clone the repository
2. Install dependencies:
```txt
npm install
```

3. Create a `.dev.vars` file in the root directory with the following environment variables:
```
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```txt
npm run dev
```

5. For deployment:
```txt
npm run deploy
```

### Frontend Setup

1. Navigate to the UI directory:
```txt
cd UI
```

2. Install dependencies:
```txt
pnpm install
```

3. Start the development server:
```txt
pnpm dev
```

The UI will be available at `http://localhost:5173`

### Type Generation

For generating/synchronizing types based on your Worker configuration run:
```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
