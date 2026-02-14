# Gotham Valet (Concierge)

AI-powered NYC concierge built with Next.js.  
It can chat, reason, call tools, and return rich UI cards for transit, weather, events, restaurants, rides, deliveries, calendar, and budget.

## What This Project Is

`Gotham Valet` is a single-page assistant interface with:

- A streaming AI chat feed (`reasoning`, `tool_call`, `tool_result`, `assistant` events)
- A three-panel desktop layout + mobile-focused compact layout
- Tool-backed actions for NYC-specific workflows
- Graceful fallback to mock data when provider keys are missing

Primary runtime flow:

1. User sends a message from `components/chat/ChatInput.tsx`
2. `useChat` posts conversation to `POST /api/chat`
3. The chat API calls Anthropic (if configured), receives tool requests, executes tools, and streams newline-delimited JSON events back
4. Frontend renders both assistant text and typed result cards

If `ANTHROPIC_API_KEY` is missing, `/api/chat` returns a mock demo stream so the UI still works end-to-end.

## Tech Stack

- Next.js App Router (`app/`)
- React + TypeScript
- Tailwind CSS v4
- Framer Motion (interaction/animation)
- Mapbox GL (`react-map-gl` + `mapbox-gl`)
- Anthropic SDK (tool-using chat)

## Project Structure

```text
concierge/
├─ app/
│  ├─ page.tsx                 # Main shell (header + sidebars + chat + voice orb)
│  ├─ layout.tsx               # App metadata and fonts
│  └─ api/                     # Route handlers backing each capability
├─ components/
│  ├─ layout/                  # Desktop/mobile shell
│  ├─ chat/                    # Message feed + input + stream rendering
│  ├─ cards/                   # Typed tool result cards
│  ├─ widgets/                 # Side widgets (map, quick actions, finance, events)
│  ├─ voice/                   # Voice orb/transcript UI
│  └─ shared/                  # Reusable status/card primitives
├─ lib/
│  ├─ agent/                   # System prompt, tool definitions, tool executor
│  ├─ services/                # API provider integrations + mocks/fallbacks
│  ├─ hooks/                   # Chat stream + UI behavior hooks
│  ├─ mock-data.ts             # Demo/mock payloads
│  ├─ constants.ts             # NYC defaults and map constants
│  └─ types/                   # Shared types
└─ public/                     # Static assets
```

## Integrations and Fallbacks

Real provider calls when configured:

- Anthropic
- Ticketmaster
- Google Places
- Tavily
- MTA GTFS-Realtime
- Citi Bike GBFS
- OpenWeather
- DoorDash Drive
- Plaid
- Blaxel Agent proxy

Mock-first or mock-only paths in current code:

- Uber request/status routes
- MealMe search/order routes
- Resy routes + service
- OpenTable routes + service
- Calendar service/routes
- SeatGeek route

## API Surface

### Core chat

- `POST /api/chat` (streaming NDJSON events)

### Transit and weather

- `GET /api/transit/subway?station=...&line=...`
- `GET /api/transit/bikes?latitude=...&longitude=...`
- `GET /api/weather`

### Search and discovery

- `GET /api/events/search?query=...&date=...&category=...`
- `GET /api/events/seatgeek`
- `GET /api/places/search?query=...&location=...`
- `POST /api/search` (`{ "query": "..." }`)

### Actions

- `POST /api/uber/request`
- `GET /api/uber/status/:tripId`
- `POST /api/mealme/order`
- `GET /api/mealme/search`
- `POST /api/doordash/delivery`
- `GET /api/doordash/status/:id`
- `POST /api/resy/book`
- `GET /api/resy/search`
- `POST /api/opentable/book`
- `GET /api/opentable/search`

### Finance and calendar

- `GET /api/plaid/balance`
- `GET /api/plaid/transactions?period=week|month|day`
- `GET /api/calendar/events`
- `POST /api/calendar/create`

### External agent proxy

- `POST /api/agent/execute`
- `GET /api/agent/status`

## Environment Variables

Create `.env.local` in the project root (`concierge/`) and add what you need.

```bash
# AI
ANTHROPIC_API_KEY=

# Map / Voice (client-side)
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=

# Search / Discovery
TICKETMASTER_API_KEY=
GOOGLE_PLACES_API_KEY=
TAVILY_API_KEY=
OPENWEATHER_API_KEY=

# DoorDash Drive
DOORDASH_DEVELOPER_ID=
DOORDASH_KEY_ID=
DOORDASH_SIGNING_SECRET=

# Plaid
PLAID_ENV=sandbox
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ACCESS_TOKEN=

# Optional external agent backend
BLAXEL_AGENT_URL=
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint
