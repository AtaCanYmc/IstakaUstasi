# 🀄 Istaka Ustası (Okey Solver & Vision App)

Istaka Ustası is a full-stack Okey board solver and computer vision application. It helps players scan their physical Okey rack using a camera or select tiles manually, and employs optimization engines to solve the tiles into optimal melds (Runs, Groups, and Doubles) for Okey and 101 Okey games.

## 📂 Project Structure

The project is structured as a monorepo consisting of a FastAPI backend bridge service and a Vite + React + TypeScript frontend:

```text
IstakaUstasi/
├── backend/            # FastAPI microservice
│   ├── app/            # REST endpoints (auth, solver, vision routers)
│   ├── okey_core/      # Base core logic definitions (Tile, Meld, OkeyMeta types)
│   ├── okey_solver/    # Solver optimization engines (greedy, backtracking, ILP)
│   └── okey_vision/    # Roboflow-based computer vision tile recognition
└── frontend/           # React Single Page App (SPA)
    ├── src/
    │   ├── components/ # Rack Board, Tile, Picker Pool, Image Scanner, Auth modals
    │   ├── services/   # Axios API client routing configurations
    │   ├── store/      # Zustand state management and auto-layout calculators
    │   └── pages/      # Dashboard workspace assembly
    └── package.json
```

---

## ⚡ Quick Start

### 1. Run with Docker (Recommended)
You can deploy both the frontend and backend inside a single network using Docker Compose.

1. Ensure Docker is running.
2. In the project root directory, run:
   ```bash
   docker compose up --build
   ```
3. Access the services:
   * **Frontend**: Open `http://localhost:3000` in your browser.
   * **Backend API**: Running at `http://localhost:8000`.

### 2. Manual/Local Setup

#### Run the Backend Service
The backend requires Python 3.11+ and its dependencies.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will run at `http://localhost:8000`. You can inspect the API swagger documentation at `http://localhost:8000/docs`.

#### Run the Frontend App
The frontend requires Node.js (v18+) and npm.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:5173`. Any API calls to `/api/v1/*` are automatically proxied to the backend on port 8000.

---

## 🛠 Tech Stack

* **Backend**: FastAPI (Python), PyDantic, Structlog, PuLP (for integer linear programming solving), OpenCV, Roboflow (for computer vision board recognition).
* **Frontend**: React, TypeScript, Vite, Tailwind CSS v4 (styling), Zustand (state management), `@hello-pangea/dnd` (drag & drop), Lucide React (icons), Axios (API client).

---

## 🚀 Key Features

1. **Board Optimization (Solver)**:
   * Supports multiple optimization algorithms: **Backtracking** (exhaustive search), **Greedy** (ultra-fast heuristic), **ILP** (integer linear programming solver), and **Hybrid** approaches.
   * Melds calculation for Runs (*Seri*), Groups (*Per*), and Doubles (*Çift*).
2. **AI Computer Vision**:
   * Drag & drop rack images to extract tile counts, numbers, and colors automatically.
   * Vision solver combines extraction and arrangement pipelines in a single step.
3. **Interactive Rack Grid**:
   * Drag-and-drop enabled rack board representation mirroring actual play shelves.
   * Auto-organizes solved melds with visible separations between groups.
