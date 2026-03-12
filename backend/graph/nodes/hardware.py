import os
import json
import re

from langchain_core.messages import SystemMessage

from graph.state import AgentState
from graph.llm import get_chat_llm

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "prompts", "hardware.md")


def _extract_json_block(text: str) -> str:
    pattern = r"```(?:json)\s*\n(.*?)```"
    m = re.search(pattern, text, re.DOTALL)
    return m.group(1).strip() if m else text.strip()


async def hardware_node(state: AgentState) -> dict:
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

    try:
        hardware_bom = json.loads(_extract_json_block(response.content))
    except (json.JSONDecodeError, ValueError):
        hardware_bom = []

    return {
        "hardware_bom": hardware_bom,
        "messages": [response],
        "errors": [],
    }
