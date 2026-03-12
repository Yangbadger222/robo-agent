# RoboAgent - AI-Powered Robotics Design Assistant

An AI-driven pipeline for designing robots end-to-end: from project specification through URDF structure generation, motor selection, hardware BOM, ROS 2 code, and Isaac Lab RL environments.

## Architecture

- **Backend**: FastAPI + LangGraph orchestrator with specialized agent nodes
- **Frontend**: Next.js 14 with pipeline stepper UI, Zustand state management, SSE streaming
- **AI**: OpenAI GPT-4o for generation, ChromaDB for RAG, optional Nexar for component search

## Quick Start

### Backend

```bash
cd robo-agent/backend
cp .env.example .env
# Edit .env with your OPENAI_API_KEY

pip install -e ".[dev]"
python -m rag.ingest          # ingest seed documents into ChromaDB
uvicorn main:app --reload     # starts on http://localhost:8000
```

### Frontend

```bash
cd robo-agent/frontend
npm install
npm run dev                   # starts on http://localhost:3000
```

### Docker

```bash
docker-compose up --build
```

## Pipeline Steps

| Step | Description | Agent |
|------|-------------|-------|
| 1. Project | Define robot specs (DOF, payload, reach, budget) | — |
| 2. Structure | Generate URDF with AI assistance | Structure Agent |
| 3. Motors | Select motors per joint with torque analysis | Motor Agent |
| 4. Hardware | MCU, drivers, sensors, comms, power | Hardware Agent |
| 5. Software | ROS 2 nodes + Isaac Lab RL environment | ROS2 + Isaac Agents |
| 6. Review | Summary, BOM, export ZIP | — |

## API Endpoints

- `GET /api/health` — Health check
- `POST /api/project` — Save project specification
- `POST /api/step/{step_id}` — Run agent step (SSE streaming)
- `GET /api/export/{project_id}` — Download generated files as ZIP

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `NEXAR_CLIENT_ID` | No | Nexar API client ID |
| `NEXAR_CLIENT_SECRET` | No | Nexar API client secret |
| `CHROMA_PERSIST_DIR` | No | ChromaDB storage path (default: `./chroma_data`) |

## Testing

```bash
cd robo-agent/backend
pytest tests/ -v
```
