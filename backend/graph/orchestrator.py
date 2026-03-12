from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage

from graph.state import AgentState
from graph.nodes.structure import structure_node
from graph.nodes.motor import motor_node
from graph.nodes.hardware import hardware_node
from graph.nodes.ros2 import ros2_node
from graph.nodes.isaac import isaac_node
from graph.nodes.validator import validator_node

MAX_ITERATIONS = 3

STEP_SEQUENCE = ["structure", "motor", "hardware", "software"]


def build_context_prompt(state: AgentState) -> str:
    sections = []

    if state.get("project_spec"):
        sections.append(f"## Project Specification\n{state['project_spec']}")

    if state.get("structure_spec"):
        spec = state["structure_spec"]
        sections.append(
            f"## Structure Specification\n"
            f"Robot: {spec.get('robot_name', 'N/A')}\n"
            f"Links: {spec.get('links', [])}\n"
            f"Joints: {spec.get('joints', [])}"
        )

    if state.get("urdf_code"):
        sections.append(f"## Current URDF\n```xml\n{state['urdf_code']}\n```")

    if state.get("motor_selections"):
        lines = []
        for m in state["motor_selections"]:
            lines.append(f"- {m.get('joint_name', '?')}: {m.get('recommended_motor', 'TBD')} "
                         f"(torque={m.get('torque_nm', '?')} Nm)")
        sections.append("## Motor Selections\n" + "\n".join(lines))

    if state.get("hardware_bom"):
        lines = [f"- {item.get('category', '?')}: {item.get('name', 'TBD')} "
                 f"({item.get('manufacturer', '')} {item.get('mpn', '')})"
                 for item in state["hardware_bom"]]
        sections.append("## Hardware BOM\n" + "\n".join(lines))

    return "\n\n".join(sections) if sections else "No prior context available."


def route_by_step(state: AgentState) -> str:
    step = state.get("step", "structure")
    mapping = {
        "structure": "structure_node",
        "motor": "motor_node",
        "hardware": "hardware_node",
        "software": "software_node",
    }
    return mapping.get(step, "structure_node")


async def software_node(state: AgentState) -> dict:
    ros2_result = await ros2_node(state)
    merged_code = {**(state.get("generated_code") or {}), **ros2_result.get("generated_code", {})}

    intermediate_state = {**state, "generated_code": merged_code}
    isaac_result = await isaac_node(intermediate_state)

    merged_code.update(isaac_result.get("generated_code", {}))
    all_responses = list(ros2_result.get("messages", [])) + list(isaac_result.get("messages", []))

    return {
        "generated_code": merged_code,
        "messages": all_responses,
        "errors": [],
    }


def route_after_validation(state: AgentState) -> str:
    if state.get("errors") and (state.get("iteration") or 0) < MAX_ITERATIONS:
        return route_by_step(state)
    return END


builder = StateGraph(AgentState)

builder.add_node("structure_node", structure_node)
builder.add_node("motor_node", motor_node)
builder.add_node("hardware_node", hardware_node)
builder.add_node("software_node", software_node)
builder.add_node("validator_node", validator_node)

builder.set_conditional_entry_point(route_by_step)

builder.add_edge("structure_node", "validator_node")
builder.add_edge("motor_node", "validator_node")
builder.add_edge("hardware_node", "validator_node")
builder.add_edge("software_node", "validator_node")

builder.add_conditional_edges("validator_node", route_after_validation)

graph = builder.compile()
