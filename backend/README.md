# Istaka Ustası — FastAPI Bridge Server

> Bridge microservice that exposes the `okey-solver-py` combinatorial engine and the Roboflow computer-vision pipeline over a secure, async REST API.

[![Python](https://img.shields.io/badge/Python-3.11-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

---

## Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Local Setup](#local-setup)
- [Docker](#docker)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Observability](#observability)

---

## Features

### Solver Engine
Delegates to the `okey-solver-py` Python library, exposing **eight interchangeable strategies** via a single `POST /solver/arrange` endpoint:

| Strategy | Algorithm | Characteristic |
|----------|-----------|----------------|
| `backtracking` | DFS with pruning | Exact — default |
| `greedy` | Value-descending selection | Fastest approximate |
| `ilp` | Integer Linear Programming (PuLP) | Mathematically optimal |
| `hybrid` | Greedy seed + backtracking refinement | Speed/accuracy balance |
| `beam` | Width-limited best-first search | Scalable exploration |
| `genetic` | Evolutionary crossover/mutation | Highly complex hands |
| `annealing` | Simulated annealing random walk | Avoids local optima |
| `mcts` | Monte Carlo Tree Search | Statistical sampling |

Each strategy respects the `allow_one_after` flag, which enables a lenient *one-tile extension* rule for Runs (*Seri*).

### Asynchronous Vision Pipeline
Vision endpoints (`/vision/extract`, `/vision/solve`) accept image uploads and immediately return a **202 Accepted** response with a `job_id`. Processing runs on FastAPI `BackgroundTasks`:

```
Client → POST /vision/extract
              └── 202 { job_id }
                        └── BackgroundTask
                                 ├── Decrypt Roboflow credentials
                                 ├── Roboflow Workflow inference
                                 ├── Tile coordinate parsing
                                 └── (solve) okey-solver-py
Client → GET  /vision/jobs/{job_id}    (polled every ~1 s)
              └── { status, result, error }
```

### BYOK — Per-User Encrypted Credentials
Each user stores their own Roboflow workspace, workflow, and API key in `public.user_roboflow_keys`. The `EncryptionService` applies **AES encryption** before writing to Supabase and decrypts per-request. No shared rate limits are enforced.

### Security-First Image Validation
All uploads pass through `validate_and_sanitize_image` before any decode occurs:

1. **5 MB size ceiling** — enforced at ingress before reading the full payload
2. **Magic-byte check** — validates JPEG (`\xff\xd8\xff`), PNG (`\x89PNG\r\n\x1a\n`), WebP (`RIFF…WEBP`) binary signatures
3. **Pillow strict verify** — structural integrity validation catches truncated or corrupted files
4. **EXIF sanitization** — clean re-encode strips all embedded metadata from the byte stream

### Authentication
JWT tokens issued by **Supabase GoTrue** are validated on every protected route via the `get_current_user` dependency. Token verification uses `supabase.auth.get_user(token)` — no custom JWT parsing required.

### Observability
- **Structured logging**: `structlog` with JSON output and per-request context binding
- **OpenTelemetry**: distributed traces for every HTTP span and background task via `otel_config.setup_opentelemetry`
- **Correlation**: all log lines include `trace_id` / `span_id` for cross-service debugging

---

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   └── exceptions.py          # Global exception handlers
│   ├── db/
│   │   ├── __init__.py            # DatabaseFactory (provider resolution)
│   │   ├── base.py                # Abstract interfaces & Pydantic models
│   │   └── supabase.py            # Supabase implementation
│   ├── dependencies/
│   │   ├── auth.py                # get_current_user FastAPI dependency
│   │   └── image_validation.py    # validate_and_sanitize_image dependency
│   ├── models/
│   │   ├── auth.py                # AuthResponse, RoboflowKeyResponse, …
│   │   ├── solver.py              # ArrangeRequest, ArrangementResult
│   │   └── vision.py              # JobStatusResponse, ExtractResultCustom
│   ├── routers/
│   │   ├── auth.py                # /auth/** (signup, login, profile, keys)
│   │   ├── solver.py              # /solver/arrange
│   │   └── vision.py              # /vision/extract, /vision/solve, /vision/jobs
│   ├── services/
│   │   ├── encryption.py          # AES encrypt/decrypt for Roboflow keys
│   │   ├── job_service.py         # In-memory job store (UUID → status/result)
│   │   └── user_service.py        # Profile sync and creation
│   ├── utils/
│   │   └── i18n.py                # Localized backend error messages
│   └── main.py                    # FastAPI app + CORS + router registration
├── tests/
│   ├── test_auth_key_endpoints.py
│   └── …
├── Dockerfile
├── pyproject.toml
├── requirements.txt
├── .env.example
└── .pre-commit-config.yml
```

---

## Configuration

Copy the example and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | `https://<project-id>.supabase.co` |
| `SUPABASE_KEY` | ✅ | **service_role** secret key (*not* anon) |
| `OKEY_RF_KEY` | Optional | Roboflow API key used as server-side fallback |
| `OKEY_RF_WORKSPACE` | Optional | Roboflow workspace slug |
| `OKEY_RF_WORKFLOW_ID` | Optional | Roboflow workflow identifier |
| `OKEY_RF_API_URL` | Optional | Defaults to `https://serverless.roboflow.com` |
| `DB_PROVIDER` | Optional | `supabase` (default) |

> **Critical:** `SUPABASE_KEY` must be the `service_role` key. Using the `anon` key causes RLS policy violations (`42501`) when the backend writes to `public.users`.

---

## Local Setup

### 1. Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Pre-commit Hooks

```bash
pre-commit install
```

Runs `black` (formatter), `isort` (import sorter), and `flake8` (linter) on every commit.

### 3. Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| URL | Description |
|-----|-------------|
| http://localhost:8000/docs | Swagger UI (interactive) |
| http://localhost:8000/redoc | ReDoc (read-only) |
| http://localhost:8000/api/v1/health | Health check |

---

## Docker

Build and run the backend in isolation:

```bash
docker build -t istaka-backend .
docker run -p 8000:8000 --env-file .env istaka-backend
```

Or run the full stack from the monorepo root:

```bash
cd ..
docker compose up --build
```

The `Dockerfile` installs native OS libraries required by OpenCV/Pillow automatically.

---

## Database Schema

Migrations live in `../supabase/migrations/` and must be applied via the Supabase SQL Editor or Supabase CLI.

### `public.users`
```sql
create table public.users (
    id         uuid references auth.users on delete cascade primary key,
    email      text not null,
    username   text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Row-Level Security
alter table public.users enable row level security;
create policy "Users can read and update their own record"
    on public.users for all
    using (auth.uid() = id) with check (auth.uid() = id);
```

### `public.user_roboflow_keys`
```sql
create table public.user_roboflow_keys (
    user_id     uuid references public.users on delete cascade primary key,
    api_key     text not null,        -- AES-encrypted
    workspace   text,
    workflow_id text,
    api_url     text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

alter table public.user_roboflow_keys enable row level security;
create policy "Users can manage their own Roboflow keys"
    on public.user_roboflow_keys for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### `public.quota_logs`
```sql
create table public.quota_logs (
    id        bigserial primary key,
    user_id   uuid references public.users on delete cascade not null,
    action    text not null,
    timestamp timestamptz not null default now()
);
```

Apply with the Supabase CLI:
```bash
supabase link --project-ref <project-id>
supabase db push
```

---

## API Endpoints

All routes are mounted under the `/api/v1` prefix.

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/signup` | — | Register user (email + password + username) |
| `POST` | `/login` | — | Authenticate; returns access & refresh tokens |
| `POST` | `/sync` | Bearer | Sync profile from Supabase Auth metadata |
| `PUT` | `/profile` | Bearer | Update display username |
| `GET` | `/roboflow-key` | Bearer | Fetch masked Roboflow configuration |
| `POST` | `/roboflow-key` | Bearer | Save or update Roboflow credentials (AES-encrypted) |
| `DELETE` | `/roboflow-key` | Bearer | Remove Roboflow credentials |

### Solver — `/api/v1/solver`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/arrange` | Bearer | Solve a tile hand; returns melds + scores + remaining tiles |

**Request body example:**
```json
{
  "tiles": [
    { "color": "RED", "value": 5 },
    { "color": "RED", "value": 6 },
    { "color": "RED", "value": 7 }
  ],
  "okey_meta": { "color": "BLACK", "value": 3 },
  "strategy": "backtracking",
  "allow_one_after": true
}
```

### Vision — `/api/v1/vision`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/extract` | Bearer | Upload rack image → async tile extraction |
| `POST` | `/solve` | Bearer | Upload rack image → async extract + solve |
| `GET` | `/jobs/{job_id}` | Bearer | Poll async job status |

Vision endpoints accept `multipart/form-data` with `file` field (JPEG / PNG / WebP, ≤ 5 MB).

**Job status response:**
```json
{
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "completed",
  "result": { … },
  "error": null
}
```
`status` values: `processing` | `completed` | `failed`

---

## Testing

```bash
# From the backend directory with venv active:
pytest tests/ -v

# With coverage:
pytest tests/ --cov=app --cov-report=term-missing
```

Tests use `pytest-asyncio` for async route testing and `unittest.mock` for Supabase client isolation.

---

## Observability

Structured log output (JSON) is sent to stdout and can be ingested by any log aggregator:

```json
{
  "event": "Tile extraction background task completed",
  "job_id": "abc-123",
  "user_id": "uuid-...",
  "timestamp": "2026-07-21T18:00:00Z",
  "level": "info",
  "logger": "okey_bridge_server.routers.vision"
}
```

OpenTelemetry spans are exported via the configured exporter (defaults to console in development). Set `OTEL_EXPORTER_OTLP_ENDPOINT` to forward to Jaeger, Tempo, or any OTLP-compatible backend.
