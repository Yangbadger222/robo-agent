from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api", tags=["project"])

_projects: dict[str, dict] = {}


class ProjectSpec(BaseModel):
    project_id: str = Field(default="default")
    robot_name: str
    robot_type: str = Field(description="e.g., arm, mobile, humanoid, quadruped")
    dof: int = Field(ge=1, le=30)
    payload_kg: float = Field(ge=0)
    reach_m: float = Field(ge=0)
    budget_usd: float = Field(ge=0)
    description: str = ""


@router.post("/project")
async def save_project(spec: ProjectSpec):
    _projects[spec.project_id] = spec.model_dump()
    return {"status": "saved", "project_id": spec.project_id}


@router.get("/project/{project_id}")
async def get_project(project_id: str):
    if project_id not in _projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return _projects[project_id]
