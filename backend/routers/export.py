import io
import json
import zipfile
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["export"])


class ExportRequest(BaseModel):
    generated_code: dict[str, str] = {}


@router.post("/export/{project_id}")
async def export_project(project_id: str, req: ExportRequest):
    generated_code = req.generated_code

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename, content in generated_code.items():
            zf.writestr(f"{project_id}/{filename}", content)

        if not generated_code:
            zf.writestr(f"{project_id}/README.md", f"# {project_id}\nNo generated files yet.\n")

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={project_id}.zip"},
    )
