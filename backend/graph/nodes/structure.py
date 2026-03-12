import os
import re
import xml.etree.ElementTree as ET

from langchain_core.messages import SystemMessage

from graph.state import AgentState
from graph.llm import get_chat_llm

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "prompts", "structure.md")


def _parse_urdf_spec(urdf_xml: str) -> dict:
    try:
        root = ET.fromstring(urdf_xml)
        links = [{"name": l.get("name")} for l in root.findall("link")]
        joints = []
        for j in root.findall("joint"):
            joints.append({
                "name": j.get("name"),
                "type": j.get("type"),
                "parent": j.find("parent").get("link") if j.find("parent") is not None else None,
                "child": j.find("child").get("link") if j.find("child") is not None else None,
            })
        return {"robot_name": root.get("name", "robot"), "links": links, "joints": joints}
    except ET.ParseError:
        return {}


def _extract_code_block(text: str) -> str:
    pattern = r"```(?:xml|urdf)\s*\n(.*?)```"
    m = re.search(pattern, text, re.DOTALL)
    return m.group(1).strip() if m else text.strip()


async def structure_node(state: AgentState) -> dict:
    with open(PROMPT_PATH) as f:
        system_prompt = f.read()

    from graph.orchestrator import build_context_prompt
    context = build_context_prompt(state)

    llm = get_chat_llm()

    msgs = [
        SystemMessage(content=system_prompt),
        SystemMessage(content=context),
    ]

    if state.get("errors"):
        msgs.append(SystemMessage(
            content="Previous validation errors to fix:\n" + "\n".join(state["errors"])
        ))

    msgs.extend(state.get("messages", []))

    response = await llm.ainvoke(msgs)
    urdf_code = _extract_code_block(response.content)
    structure_spec = _parse_urdf_spec(urdf_code)

    return {
        "urdf_code": urdf_code,
        "structure_spec": structure_spec,
        "generated_code": {**(state.get("generated_code") or {}), "robot.urdf": urdf_code},
        "messages": [response],
        "errors": [],
    }
