import json
from fastapi import APIRouter
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from langchain_core.messages import HumanMessage, AIMessage
from graph.orchestrator import graph
from graph.state import AgentState

router = APIRouter(prefix="/api", tags=["step"])


class StepRequest(BaseModel):
    messages: list[dict]
    project_spec: dict = {}
    structure_spec: dict = {}
    motor_selections: list[dict] = []
    hardware_bom: list[dict] = []
    generated_code: dict[str, str] = {}


@router.post("/step/{step_id}")
async def run_step(step_id: str, req: StepRequest):
    lc_messages = []
    for m in req.messages:
        if m["role"] == "user":
            lc_messages.append(HumanMessage(content=m["content"]))
        else:
            lc_messages.append(AIMessage(content=m["content"]))

    initial_state: AgentState = {
        "messages": lc_messages,
        "step": step_id,
        "project_spec": req.project_spec,
        "structure_spec": req.structure_spec,
        "urdf_code": req.generated_code.get("robot.urdf", ""),
        "motor_selections": req.motor_selections,
        "hardware_bom": req.hardware_bom,
        "generated_code": req.generated_code,
        "errors": [],
        "iteration": 0,
    }

    async def event_generator():
        try:
            async for event in graph.astream_events(initial_state, version="v2"):
                kind = event["event"]
                if kind == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    if hasattr(chunk, "content") and chunk.content:
                        yield {"event": "token", "data": json.dumps({"content": chunk.content})}
                elif kind == "on_chain_end" and event.get("name") == "LangGraph":
                    output = event["data"].get("output", {})
                    serializable = {
                        k: v for k, v in output.items()
                        if k != "messages"
                    }
                    yield {"event": "result", "data": json.dumps(serializable, default=str)}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}
        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_generator())
