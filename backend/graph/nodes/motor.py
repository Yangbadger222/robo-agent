import os
import json
import re

from langchain_core.messages import SystemMessage

from graph.state import AgentState
from graph.llm import get_chat_llm

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "prompts", "motor.md")

DEFAULT_LINK_MASS_KG = 1.0
DEFAULT_ARM_LENGTH_M = 0.15


def _extract_json_block(text: str) -> str:
    pattern = r"```(?:json)\s*\n(.*?)```"
    m = re.search(pattern, text, re.DOTALL)
    return m.group(1).strip() if m else text.strip()


def _compute_torques(state: AgentState) -> list[dict]:
    joints = (state.get("structure_spec") or {}).get("joints", [])
    results = []
    for joint in joints:
        jtype = joint.get("type", "")
        if jtype in ("revolute", "continuous", "prismatic"):
            mass = DEFAULT_LINK_MASS_KG
            arm_len = DEFAULT_ARM_LENGTH_M
            torque = mass * arm_len * 9.81 * 2.0
            results.append({
                "joint_name": joint["name"],
                "joint_type": jtype,
                "estimated_torque_nm": round(torque, 3),
            })
    return results


async def motor_node(state: AgentState) -> dict:
    with open(PROMPT_PATH) as f:
        system_prompt = f.read()

    from graph.orchestrator import build_context_prompt
    context = build_context_prompt(state)

    torque_results = _compute_torques(state)
    pre_context = f"## Computed Torque Requirements\n{json.dumps(torque_results, indent=2)}"

    llm = get_chat_llm()

    msgs = [
        SystemMessage(content=system_prompt),
        SystemMessage(content=context),
        SystemMessage(content=pre_context),
    ]

    if state.get("errors"):
        msgs.append(SystemMessage(
            content="Previous validation errors to fix:\n" + "\n".join(state["errors"])
        ))

    msgs.extend(state.get("messages", []))

    response = await llm.ainvoke(msgs)

    try:
        motor_selections = json.loads(_extract_json_block(response.content))
    except (json.JSONDecodeError, ValueError):
        motor_selections = []

    return {
        "motor_selections": motor_selections,
        "messages": [response],
        "errors": [],
    }
