# 🎴 Istaka Ustası Frontend (React + TypeScript + Vite)

This is the user interface client for the **Istaka Ustası (Okey Solver)** application. Built using Vite, React, TypeScript, Tailwind CSS v4, Zustand, and `@hello-pangea/dnd`.

## 🚀 Technical Highlights

### 1. Smart Rack Layout Algorithm
When the backend solver returns the optimal melds, the frontend Zustand store calculates a visually pleasant layout:
* Divides the rack into **2 rows of 20 slots** (40 slots in total).
* Places melds sequentially while leaving **empty slots** between different groups.
* Wraps meld groups automatically if they exceed row boundaries.
* Collects remaining/unarranged tiles at the end of the second row, separated by gaps.

### 2. Interactive Drag & Drop
* Integrated `@hello-pangea/dnd` to map rack slots.
* Users can manually swap and rearrange tiles on the rack by dragging them into empty slots or other tile locations.

### 3. Tailwind CSS v4
* Leverages Tailwind CSS v4 for a utility-first styling architecture.
* Features responsive glassmorphic interfaces, high-fidelity Okey tile assets with 3D gradients, and dark mode base styling.

---

## 📂 Codebase Overview

* **`src/components/`**:
  * **`Board.tsx`**: Renders the Okey rack grid and manages Drag & Drop handlers.
  * **`Tile.tsx`**: High-fidelity Okey tile renderer mapping numbers, colors, indicators, and deletion handlers.
  * **`TilePool.tsx`**: A panel to select tiles to place on the rack and set the Okey Indicator tile (okeyMeta).
  * **`VisionUpload.tsx`**: Drag & drop zone to upload images of a real Okey board, showing quota and loading states.
  * **`AuthModal.tsx`**: Authenticates users to access the vision endpoints.
* **`src/services/api.ts`**: Axios client with API endpoints mapping and JWT header injection interceptors.
* **`src/store/store.ts`**: Zustand state container managing rack cells, solver metadata, and auth workflows.

---

## ⚙️ Development Commands

In the frontend directory:

* **Install dependencies**:
  ```bash
  npm install
  ```
* **Start local dev server**:
  ```bash
  npm run dev
  ```
* **Build production package**:
  ```bash
  npm run build
  ```
* **Preview build**:
  ```bash
  npm run preview
  ```
