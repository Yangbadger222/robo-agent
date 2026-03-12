from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    step: str
    project_spec: dict
    structure_spec: dict
    urdf_code: str
    motor_selections: list[dict]
    hardware_bom: list[dict]
    generated_code: dict[str, str]
    errors: list[str]
    iteration: int
