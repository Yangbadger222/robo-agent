from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.project import router as project_router
from routers.step import router as step_router
from routers.export import router as export_router

app = FastAPI(title="RoboAgent", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project_router)
app.include_router(step_router)
app.include_router(export_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
