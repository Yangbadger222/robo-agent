import os

from langchain_core.messages import SystemMessage

from graph.state import AgentState
from graph.llm import get_chat_llm
from graph.nodes.code_utils import extract_code_blocks

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "prompts", "ros2.md")


async def ros2_node(state: AgentState) -> dict:
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
    code_blocks = extract_code_blocks(response.content)

    generated_code = {**(state.get("generated_code") or {}), **code_blocks}

    return {
        "generated_code": generated_code,
        "messages": [response],
        "errors": [],
    }
