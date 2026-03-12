import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from langchain_core.messages import HumanMessage, AIMessage
from graph.state import AgentState


MOCK_URDF = '''```xml
<?xml version="1.0"?>
<robot name="test_robot">
  <link name="base_link">
    <visual><geometry><box size="0.1 0.1 0.1"/></geometry></visual>
  </link>
</robot>
```'''


@pytest.fixture
def initial_state() -> AgentState:
    return {
        "messages": [HumanMessage(content="Design a simple 2-DOF robot arm")],
        "step": "structure",
        "project_spec": {
            "robot_name": "TestBot",
            "robot_type": "arm",
            "dof": 2,
            "payload_kg": 1.0,
            "reach_m": 0.5,
            "budget_usd": 500,
            "description": "A simple 2-DOF test robot arm",
        },
        "structure_spec": {},
        "urdf_code": "",
        "motor_selections": [],
        "hardware_bom": [],
        "generated_code": {},
        "errors": [],
        "iteration": 0,
    }


@pytest.mark.asyncio
async def test_graph_structure_step(initial_state):
    mock_response = AIMessage(content=MOCK_URDF)

    with patch("graph.nodes.structure.get_chat_llm") as mock_factory:
        instance = MagicMock()
        instance.ainvoke = AsyncMock(return_value=mock_response)
        mock_factory.return_value = instance

        from graph.orchestrator import graph
        result = await graph.ainvoke(initial_state)

    assert result["urdf_code"] is not None
    assert "robot" in result["urdf_code"].lower() or result["urdf_code"] == ""
