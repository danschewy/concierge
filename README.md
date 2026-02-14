# Gotham Valet: NYC AI Concierge

### 🚀 [**concierge-puce.vercel.app**](https://concierge-puce.vercel.app)

Hackathon submission: an action-first AI concierge for New York City that plans, executes, and monitors real-world tasks in one interface.

## TL;DR for Judges
Gotham Valet is not just chat. It is a tool-orchestrating operations layer that:

- Streams reasoning, tool calls, and results in real time
- Uses browser location permission to personalize decisions
- Mixes live APIs with graceful fallbacks when credentials are missing
- Tracks long-running work using **Blaxel** jobs (DoorDash watch + staged Uber timeline)
- Renders rich status cards that continue updating after the initial response

If you only test one thing: open `/dashboard`, allow location, run **Cool Test Message**, then run **DD Candy Test** from Quick Actions.

## What Problem We Solved
City decisions are dynamic and multi-factor: transit disruptions, weather, budget, timing, and fulfillment status all change minute to minute.

Most assistants answer once and stop. Gotham Valet executes tools, returns structured cards, and keeps monitoring tasks in the background.

## 3 Differentiators

1. **Real orchestration, not static chat**
- `/api/chat` runs a multi-turn tool loop with Anthropic tool-use.
- The frontend shows a live event stream (`reasoning`, `tool_call`, `tool_result`, `assistant`, `done`).

2. **Location-aware execution by default**
- Browser geolocation is requested client-side.
- Tool defaults are applied server-side (nearest station, weather/bikes at exact coordinates, delivery pickup normalization).

3. **Long-running task tracking with Blaxel**
- DoorDash and Uber-style timelines are represented as async task refs.
- Cards poll status endpoints and display tracking state (`queued/running/success/failed`).
- Blaxel integration handles delayed/ongoing workflows beyond one request-response cycle.

## Demo Script (3-5 minutes)

### 1) Open the app
- Start app: `npm run dev`
- Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Allow browser location permission

### 2) Multi-tool live mission
- Click **Cool Test Message**
- Watch:
  - reasoning messages stream in
  - tool calls execute
  - cards appear (weather, subway, bikes, budget, events, restaurants, web)

### 3) DoorDash + Blaxel monitoring
- Click **DD Candy Test** (Quick Actions -> Services)
- Expected on Errand card:
  - `Source: DoorDash Live`
  - DoorDash raw status
  - support reference
  - tracking URL link
  - Blaxel task status

### 4) Ride timeline behavior
- Trigger a ride request
- Ride card advances through staged statuses and polls live status route
- Tracking status is shown (Blaxel or local fallback)

### 5) Optional voice input
- Tap Voice Orb
- Speak prompt
- Audio transcribes through ElevenLabs STT and pre-fills chat input

## System Architecture

```text
User (Web UI)
  -> useChat() (geolocation + streaming parser)
  -> POST /api/chat
     -> Anthropic messages API (tool-use)
     -> Tool Executor (lib/agent/tool-executor.ts)
     -> Service layer (weather, MTA, Citi Bike, DoorDash, etc.)
     -> Optional async task ref (Blaxel/local)
  -> NDJSON event stream back to client
  -> AgentFeed renders chat + cards
  -> Cards poll status endpoints for live progression
```

Key runtime files:

- Chat orchestrator: `/Users/dan/Code/concierge/app/api/chat/route.ts`
- Tool schema: `/Users/dan/Code/concierge/lib/agent/tools.ts`
- Tool execution: `/Users/dan/Code/concierge/lib/agent/tool-executor.ts`
- Streaming UI state: `/Users/dan/Code/concierge/lib/hooks/useChat.ts`
- Card rendering: `/Users/dan/Code/concierge/components/chat/AgentFeed.tsx`

## Blaxel Integration (Important)

### Why Blaxel is used
Some workflows are inherently long-running (delivery lifecycle, delayed ride progression). Blaxel provides execution state outside the immediate chat response.

### Where it lives
- Blaxel service adapter: `/Users/dan/Code/concierge/lib/services/blaxel.ts`
- Job template (DoorDash watch): `/Users/dan/Code/concierge/blaxel/jobs/doordash-watch-ts`
- Job template (mock Uber delay): `/Users/dan/Code/concierge/blaxel/jobs/mock-uber-delay`

### Jobs wired today
- `doordash_delivery_watch` -> env `BLAXEL_DOORDASH_WATCH_JOB_ID`
- `mock_uber_delay` -> env `BLAXEL_MOCK_UBER_DELAY_JOB_ID`

### Behavior
- If Blaxel is configured: cards carry `provider: blaxel` tracking refs
- If not configured: local tracking refs are used so UX still progresses
- Recent hardening includes:
  - correct execution ID parsing
  - broader status normalization (`queued/running/success/failed`)
  - resilient polling when list/index lag exists

## Live vs Mock Capability Matrix

| Capability | Provider | Current Mode | Notes |
|---|---|---|---|
| Chat orchestration | Anthropic | Live if key | Falls back to mock event stream when missing key |
| Weather | OpenWeather | Live if key | Mock weather fallback |
| Subway arrivals | MTA GTFS-RT | Live | Falls back to mock when no arrivals/errors |
| Bike availability | Citi Bike GBFS | Live | Returns empty list on failure (no fake stations) |
| Events | Ticketmaster | Live if key | Mock events fallback |
| Restaurant search | Google Places | Live if key | Mock restaurants fallback |
| Web search | Tavily | Live if key | Mock web results fallback |
| Delivery create/status | DoorDash Drive | Live if creds | Explicit API errors surfaced when configured |
| Budget summary | Plaid | Live if creds+token | Mock budget fallback |
| Ride request/status | Uber | Mock with tracking | Uses staged progression + Blaxel/local task refs |
| Food ordering | MealMe | Mock | Demo-only implementation |
| Reservations | Resy/OpenTable | Mock | Demo-only implementation |
| Calendar | Calendar service | Mock | Demo templates |
| Voice STT | ElevenLabs | Live if key | Used by Voice Orb |

## Location & Personalization Model

Location permission is first-class in the UX:

- Chat, map, and header request browser geolocation
- `near me` requests are normalized to concrete tool inputs
- For `create_delivery`:
  - server attempts reverse geocode via Mapbox
  - if unavailable, safe fallback addresses are used for sandbox testability

Reference files:
- `/Users/dan/Code/concierge/lib/hooks/useChat.ts`
- `/Users/dan/Code/concierge/app/api/chat/route.ts`
- `/Users/dan/Code/concierge/components/widgets/LiveMapInner.tsx`

## Judge-Friendly Quick Actions

Available in right panel and mobile strip:

- **Cool Test Message**: multi-tool systems check
- **Status Board**: weather + subway + bikes + disruptions
- **Running Late**: calendar + transit strategy
- **DD Candy Test**: known-good DoorDash sandbox request

Config file:
- `/Users/dan/Code/concierge/lib/constants/quick-actions.ts`

## API Surface (Core)

### Chat + voice
- `POST /api/chat` (streaming NDJSON)
- `POST /api/voice/transcribe`

### Transit + weather
- `GET /api/transit/subway`
- `GET /api/transit/bikes`
- `GET /api/weather`

### Search
- `GET /api/events/search`
- `GET /api/places/search`
- `POST /api/search`

### Actions
- `POST /api/doordash/delivery`
- `GET /api/doordash/status/:id`
- `POST /api/uber/request`
- `GET /api/uber/status/:tripId`
- `POST /api/mealme/order`
- `POST /api/resy/book`
- `POST /api/opentable/book`

### Finance + calendar
- `GET /api/plaid/balance`
- `GET /api/plaid/transactions`
- `GET /api/calendar/events`
- `POST /api/calendar/create`

### Async task bridge
- `POST /api/agent/execute`
- `GET /api/agent/status`

## Local Setup

### Prerequisites
- Node.js 18+
- npm

### Install and run

```bash
npm install
npm run dev
```

Open:
- Landing: [http://localhost:3000](http://localhost:3000)
- Main app: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Environment Variables

Create `.env.local` in repo root.

```bash
# Core LLM
ANTHROPIC_API_KEY=

# Map + location
NEXT_PUBLIC_MAPBOX_TOKEN=

# Voice
ELEVENLABS_API_KEY=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=
ELEVENLABS_STT_MODEL_ID=scribe_v1
ELEVENLABS_STT_LANGUAGE_CODE=en

# Discovery + live city signals
OPENWEATHER_API_KEY=
TICKETMASTER_API_KEY=
GOOGLE_PLACES_API_KEY=
TAVILY_API_KEY=

# DoorDash Drive
DOORDASH_DEVELOPER_ID=
DOORDASH_KEY_ID=
DOORDASH_SIGNING_SECRET=

# Plaid
PLAID_ENV=sandbox
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ACCESS_TOKEN=

# Blaxel
BLAXEL_API_KEY=
BLAXEL_API_BASE_URL=https://api.blaxel.ai/v0
BLAXEL_DOORDASH_WATCH_JOB_ID=
BLAXEL_MOCK_UBER_DELAY_JOB_ID=

# Optional legacy proxy
BLAXEL_AGENT_URL=
```

## Verification Checklist for Judges

- [ ] Chat stream shows reasoning + tool call + tool result sequence
- [ ] Assistant/user messages render markdown (lists, links, code blocks)
- [ ] Location permission changes behavior of map and nearby tools
- [ ] Cool Test Message triggers multiple tools in one run
- [ ] DD Candy Test creates DoorDash delivery and shows support reference
- [ ] Delivery/Ride cards continue polling and updating status
- [ ] Blaxel task status visible on relevant cards

## Known Limitations

- Uber, MealMe, Resy/OpenTable, Calendar are currently mock implementations
- MTA station mapping is intentionally partial for common NYC stations
- Build may require outbound network for Google font fetches in `next/font/google`

## Repository Structure

```text
app/
  page.tsx                 # Marketing landing page
  dashboard/page.tsx       # Main concierge app
  api/                     # Route handlers (chat, tools, integrations)
components/
  chat/                    # Streaming chat UI + markdown rendering
  cards/                   # Typed result cards with polling
  widgets/                 # Live map, quick actions, finance/events mini panels
  layout/                  # Desktop/mobile shell
  voice/                   # Voice orb + transcript UI
lib/
  agent/                   # System prompt, tool schema, executor
  services/                # Provider integrations (live + mock)
  hooks/                   # Streaming + location-aware chat state
  constants/               # NYC defaults + prompts + quick actions
  utils/                   # Tracking serialization, formatting helpers
blaxel/
  jobs/doordash-watch-ts/  # Long-running DoorDash watch job template
  jobs/mock-uber-delay/    # Long-running staged Uber mock job template
```

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - run ESLint
