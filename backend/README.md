# Istaka Ustasi Backend - FastAPI Bridge Server

FastAPI-based bridge microservice that exposes the capabilities of the `okey-solver-py` library. It handles optimal Okey tile arrangements (solving hands) and image processing to detect tiles, wrapped with Google Authentication and weekly quotas managed via Supabase.

---

## Features

- **Okey Solver Engine**: Exposes optimal tile arrangement algorithms supporting multiple strategies:
  - `backtracking` (Standard/Default)
  - `greedy`
  - `ilp` (Integer Linear Programming)
  - `hybrid`
- **Vision Extraction**: Processes board images using Roboflow workflows to detect and extract tiles.
- **Authentication**: Google Auth JWT token validation middleware utilizing Supabase Auth.
- **Quota Management**:
  - Implements a weekly replenishment cycle (7 days reset).
  - Restricts image extractions (`image_quota_count` defaults to 5).
  - Restricts solver queries (`solver_quota_count` defaults to 20).
- **Database Repository Factory Pattern**: Decoupled repository architecture under the `db/` folder to switch providers easily (Supabase default).
- **Docker Support**: Built-in Dockerfile and Docker Compose settings for local development and production.
- **Developer Linting Hook**: Integrated `pre-commit` pipeline with `black`, `isort`, and `flake8`.

---

## Project Structure

```
backend/
├── core/                # Exception handlers and custom exceptions
├── db/                  # Database repository layer & Factory pattern
├── dependencies/        # Auth security dependencies (Supabase JWT check)
├── models/              # Pydantic schemas (Request & Response models)
├── routers/             # FastAPI modular routing endpoints
├── services/            # Decoupled business logic (user sync, logs)
├── main.py              # Application entrypoint
├── pyproject.toml       # Project metadata & build tool configuration
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker container configurations
├── docker-compose.yml   # Multi-container local orchestration
└── .pre-commit-config.yml
```

---

## Configuration (`.env`)

Create a `.env` file in the backend root directory containing:

```env
# Roboflow API Configuration (Optional, required for Vision features)
OKEY_RF_KEY=your_roboflow_api_key
OKEY_RF_WORKSPACE=ata-dc7ry
OKEY_RF_WORKFLOW_ID=okey-and-rummikub-vrummikub-p8akb-vr0ef-3-yolov8n-t1-logic
OKEY_RF_API_URL=

# Supabase Credentials (Required for Auth and Quotas)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key

# Database Provider (Defaults to supabase)
DB_PROVIDER=supabase
```

---

## Local Setup

### 1. Installation

Set up a virtual environment and install the package requirements:

```bash
# Initialize and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Pre-commit Configuration

Configure Git hooks for lint formatting:

```bash
pre-commit install
```

### 3. Running the Server

Start the development server with hot-reload enabled:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Access the interactive API documentation at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Docker Deployment

Start the service containerized using Docker Compose:

```bash
docker compose up --build
```

The container handles OpenCV native OS libraries automatically and mounts your `.env` values dynamically.

---

## Supabase PostgreSQL Schema Setup

Execute the following commands in the Supabase SQL editor to initialize tables under the `public` schema:

```sql
create table public.users (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    username text,
    image_quota_count integer not null default 5,
    solver_quota_count integer not null default 20,
    last_reset_date timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table public.quota_logs (
    id bigserial primary key,
    user_id uuid references public.users on delete cascade not null,
    action text not null,
    timestamp timestamp with time zone not null default now()
);
```
