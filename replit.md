# Ultimate CricVerse

## Overview

Ultimate CricVerse is a cyberpunk-themed fantasy cricket gaming platform where users can watch live matches and play as legendary cricket players. Users select a player, pay an entry fee via simulated UPI payment, and receive AI-generated live commentary and visuals during gameplay. The application features a futuristic neon aesthetic with real-time game feeds.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom cyberpunk theme (Orbitron/Rajdhani fonts, neon colors)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions and effects
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Design**: REST endpoints defined in shared routes file with Zod validation
- **Development**: tsx for TypeScript execution without compilation step

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit with `db:push` command for schema sync

### Key Data Models
- **Matches**: Cricket matches with teams, venue, status (live/upcoming/completed)
- **Players**: Cricket players with name, role, team, price, and avatar
- **Games**: User game sessions linking match, selected player, payment, and commentary log

### API Structure
Routes are defined in `shared/routes.ts` using a type-safe pattern:
- `GET /api/matches` - List all matches
- `GET /api/matches/:id` - Get specific match
- `GET /api/players` - List all players
- `POST /api/games` - Create new game session
- `GET /api/games/:id` - Get game with commentary
- `POST /api/games/:id/log` - Add commentary entry

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (custom + shadcn)
    pages/        # Route pages (Home, PlayerSelection, GameConsole)
    hooks/        # React Query hooks for API calls
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database operations
  db.ts           # Drizzle connection
shared/           # Shared between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod
```

## External Dependencies

### AI Services (No API Key Required)
- **Pollinations AI**: Free text and image generation
  - Text API: `https://pollinations.ai/api/text?prompt=...`
  - Image API: `https://pollinations.ai/p/...`
  - Used for generating game commentary and player avatars

### Database
- **PostgreSQL**: Primary data store
- Connection via `DATABASE_URL` environment variable
- Session storage using `connect-pg-simple`

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animations
- **lucide-react**: Icon library
- **wouter**: Client-side routing
- **date-fns**: Date formatting

### UI Framework
- **shadcn/ui**: Component library based on Radix UI
- Full component set in `client/src/components/ui/`
- Configured via `components.json`

### Build & Development
- **Vite**: Frontend bundling with React plugin
- **esbuild**: Production server bundling
- **tsx**: TypeScript execution for development
- **Replit plugins**: Dev banner, cartographer, error overlay