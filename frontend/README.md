# Istaka Ustası — Frontend

> React 19 + TypeScript + Vite SPA for the Okey Solver & Computer Vision application.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Key Components](#key-components)
- [Vision Upload Flow](#vision-upload-flow)
- [Rack Layout Algorithm](#rack-layout-algorithm)
- [Internationalization](#internationalization)
- [Development Commands](#development-commands)
- [Testing](#testing)

---

## Tech Stack

| Package | Role |
|---------|------|
| **React 19** | UI rendering |
| **TypeScript 5** | Static typing |
| **Vite 6** | Dev server + production bundler |
| **Zustand** | Granular global state store |
| **Tailwind CSS v4** | Utility-first styling |
| **@hello-pangea/dnd** | Accessible drag-and-drop for the rack board |
| **Axios** | HTTP client with JWT interceptor + global 401 handler |
| **Vitest + jsdom** | Unit and component tests |
| **Lucide React** | Icon set |

---

## Project Structure

```
src/
├── components/
│   ├── AuthModal.tsx          # Login / register modal
│   ├── BackendWakingToast.tsx # Cold-start notification toast
│   ├── Board.tsx              # 40-slot drag-and-drop rack grid
│   ├── Header.tsx             # Top navigation bar
│   ├── RackControls.tsx       # Strategy selector, toggles, solve/reset buttons
│   ├── RoboflowGuideModal.tsx # Step-by-step Roboflow setup guide
│   ├── SettingsModal.tsx      # User profile + Roboflow key management
│   ├── SolverResults.tsx      # Meld groups + remaining tiles display
│   ├── Tile.tsx               # Single tile renderer (color, value, indicator)
│   ├── TilePool.tsx           # Manual tile selector + Okey indicator picker
│   ├── VisionUpload.tsx       # Drag-and-drop image upload + job polling
│   └── WorkspaceBanner.tsx    # Contextual guidance banner
├── i18n/
│   └── translations.ts        # tr / en / fr / de locale strings
├── pages/
│   └── Dashboard.tsx          # Main layout (Board + TilePool + VisionUpload + Results)
├── services/
│   └── api.ts                 # Axios instance, interceptors, typed API methods
├── store/
│   └── store.ts               # Zustand store (auth, rack, solver, vision)
└── App.tsx                    # Root: backend check + BackendWakingToast
```

---

## State Management

All application state lives in a single **Zustand** store (`src/store/store.ts`). The store is divided into four logical domains:

| Domain | State | Actions |
|--------|-------|---------|
| **Auth** | `user`, `token`, `isLoggingIn`, `authError` | `login`, `signup`, `logout`, `initializeAuth` |
| **Roboflow** | `roboflowKeyConfig` | `fetchRoboflowKeyConfig`, `saveRoboflowKeyConfig`, `deleteRoboflowKeyConfig` |
| **Rack / Solver** | `rack[40]`, `strategy`, `allowOneAfter`, `isSolving`, `solverResult`, `solveError` | `solve`, `addTile`, `removeTile`, `moveTile`, `clearRack`, `applyArrangement` |
| **Vision** | `isProcessingVision`, `visionError`, `isBackendWaking` | `uploadImageExtract`, `uploadImageSolve`, `initBackendCheck` |

### Global 401 Handler

`api.ts` registers a response interceptor that catches any `401` or `403` response and automatically calls `useStore.getState().logout()`, clearing tokens and redirecting the user to the sign-in state without requiring per-endpoint error handling.

---

## Key Components

### `Board.tsx`
Renders a **2 × 20 slot grid** (40 slots total) backed by `@hello-pangea/dnd`. Each slot is a `Droppable`; each tile is a `Draggable`. Dropping a tile onto a filled slot **swaps** the two tiles rather than displacing them.

### `RackControls.tsx`
Houses the solver **strategy dropdown** (8 strategies, localized labels), the `allowOneAfter` checkbox, a clear button, and the primary **Solve** action button with spinner state.

### `VisionUpload.tsx`
Manages the full vision upload lifecycle:
- Accepts files via **drag-and-drop** zone *or* `<input type="file">` click
- Stores the selected `File` in local state (works for both interaction modes)
- On action, calls `uploadImageExtract` or `uploadImageSolve` from the store
- Shows real-time processing state, error messages, and image preview

### `SolverResults.tsx`
Displays the arrangement returned by the solver:
- Header summary: meld count + total score
- Grid of `MeldCard` sub-components (color-coded badges: SERI / PER / CIFT)
- Unarranged remaining tiles section

### `SettingsModal.tsx`
Combines user profile editing (username) with Roboflow credential management. Pre-populates `workspace`, `workflow_id`, and `api_url` with sensible defaults so users only need to paste their API key.

---

## Vision Upload Flow

```
User drops image
       │
       ├─► selectedFile state updated
       │
       ▼
"Extract to Board" or "Extract & Solve" button
       │
       ├─► apiService.extractVision(file) → POST /vision/extract
       │          └─► 202 { job_id }
       │
       ├─► Poll GET /vision/jobs/{job_id} every 1000 ms
       │          ├─► status === "processing" → continue
       │          ├─► status === "completed"  → populate rack / apply arrangement
       │          └─► status === "failed"     → show visionError
       │
       └─► isProcessingVision = false
```

Polling has a **60-second timeout**. If the job does not complete in time, a timeout error is shown.

---

## Rack Layout Algorithm

When `applyArrangement` is called with solver output, the store computes a visually organized rack layout:

1. Iterate over each meld group sequentially
2. Place meld tiles into the next available rack slots
3. Insert **one empty slot** as a visual separator after each meld
4. After all melds, place **remaining (unarranged) tiles** at the end of the rack
5. Wrap across the two rows automatically when the current row is full

This produces a rack that visually mirrors how a skilled player would organize their hand.

---

## Internationalization

All UI strings are defined in `src/i18n/translations.ts` and accessed via the `t(key)` helper from the Zustand store. The `t` function supports **interpolation**:

```typescript
t('quotaLeft', { count: 3 })  // → "Quota: 3 extractions left"
```

Supported locales: `tr` (Turkish) · `en` (English) · `fr` (French) · `de` (German)

Language preference is persisted to `localStorage` and restored on page load.

---

## Development Commands

All commands run from the `frontend/` directory.

```bash
# Install dependencies
npm install

# Start Vite dev server (http://localhost:5173)
npm run dev

# Type-check without emitting
npm run typecheck

# Production build → dist/
npm run build

# Preview production build locally
npm run preview
```

---

## Testing

```bash
# Run all tests (Vitest + jsdom)
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

Test files are co-located with components (`*.test.tsx`) and use the `@testing-library/react` conventions.
