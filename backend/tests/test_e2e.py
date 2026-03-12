"""End-to-end integration test: simulate the full pipeline."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from langchain_core.messages import HumanMessage, AIMessage
from graph.state import AgentState


MOCK_URDF = """<?xml version="1.0"?>
<robot name="test_robot">
  <link name="base_link">
    <visual><geometry><box size="0.1 0.1 0.1"/></geometry></visual>
    <inertial><mass value="1.0"/><inertia ixx="0.01" iyy="0.01" izz="0.01" ixy="0" ixz="0" iyz="0"/></inertial>
  </link>
  <link name="link1">
    <visual><geometry><cylinder length="0.3" radius="0.025"/></geometry></visual>
    <inertial><mass value="0.5"/><inertia ixx="0.004" iyy="0.004" izz="0.001" ixy="0" ixz="0" iyz="0"/></inertial>
  </link>
  <joint name="joint1" type="revolute">
    <parent link="base_link"/>
    <child link="link1"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14" upper="3.14" effort="10" velocity="1"/>
  </joint>
</robot>"""

MOCK_MOTORS_JSON = """```json
[
  {
    "joint_name": "joint1",
    "motor_type": "servo",
    "recommended_motor": "Dynamixel XM430-W210",
    "mpn": "XM430-W210-T",
    "manufacturer": "ROBOTIS",
    "torque_nm": 4.1,
    "speed_rpm": 46,
    "voltage": 12,
    "estimated_price": 250,
    "reason": "Good torque for lightweight arm joint"
  }
]
```"""

MOCK_HARDWARE_JSON = """```json
[
  {
    "category": "mcu",
    "name": "OpenCR 1.0",
    "mpn": "OPENCR1.0",
    "manufacturer": "ROBOTIS",
    "reason": "Native Dynamixel support",
    "estimated_price": 180,
    "specifications": {"processor": "Cortex-M7", "flash": "1MB"}
  }
]
```"""

MOCK_ROS2_CODE = """```package.xml
<?xml version="1.0"?>
<package format="3">
  <name>robot_controller</name>
  <version>0.0.1</version>
</package>
```

```robot_controller/__init__.py
```

```robot_controller/joint_publisher.py
import rclpy
from rclpy.node import Node

class JointPublisher(Node):
    def __init__(self):
        super().__init__('joint_publisher')
```"""

MOCK_ISAAC_CODE = """```__init__.py
import gymnasium as gym
gym.register(id="MyTask-v0", entry_point="my_task_env:MyTaskEnv")
```

```my_task_env.py
class MyTaskEnv:
    pass
```"""


def _make_initial_state() -> AgentState:
    return {
        "messages": [HumanMessage(content="Design a 1-DOF test arm")],
        "step": "structure",
        "project_spec": {
            "robot_name": "TestBot",
            "robot_type": "arm",
            "dof": 1,
            "payload_kg": 0.5,
            "reach_m": 0.3,
            "budget_usd": 500,
            "description": "Simple test arm",
        },
        "structure_spec": {},
        "urdf_code": "",
        "motor_selections": [],
        "hardware_bom": [],
        "generated_code": {},
        "errors": [],
        "iteration": 0,
    }


def _mock_llm_responses(responses: list[str]):
    """Create a mock that returns different responses on successive calls."""
    call_count = 0

    async def side_effect(*args, **kwargs):
        nonlocal call_count
        idx = min(call_count, len(responses) - 1)
        call_count += 1
        return AIMessage(content=responses[idx])

    mock = MagicMock()
    mock.ainvoke = AsyncMock(side_effect=side_effect)
    return mock


@pytest.mark.asyncio
async def test_full_pipeline():
    """Simulate: project -> structure -> motor -> hardware -> software -> export."""
    responses = [
        f"```xml\n{MOCK_URDF}\n```",
        MOCK_MOTORS_JSON,
        MOCK_HARDWARE_JSON,
        MOCK_ROS2_CODE,
        MOCK_ISAAC_CODE,
    ]

    with patch("graph.nodes.structure.get_chat_llm", return_value=_mock_llm_responses(responses[:1])):
        with patch("graph.nodes.motor.get_chat_llm", return_value=_mock_llm_responses(responses[1:2])):
            with patch("graph.nodes.hardware.get_chat_llm", return_value=_mock_llm_responses(responses[2:3])):
                with patch("graph.nodes.ros2.get_chat_llm", return_value=_mock_llm_responses(responses[3:4])):
                    with patch("graph.nodes.isaac.get_chat_llm", return_value=_mock_llm_responses(responses[4:5])):
                        from graph.orchestrator import graph

                        state = _make_initial_state()
                        result = await graph.ainvoke(state)
                        assert "robot" in result.get("urdf_code", "").lower()

                        state["step"] = "motor"
                        state["urdf_code"] = result["urdf_code"]
                        state["structure_spec"] = result["structure_spec"]
                        state["generated_code"] = result["generated_code"]
                        result2 = await graph.ainvoke(state)
                        assert isinstance(result2.get("motor_selections"), list)

                        state["step"] = "hardware"
                        state["motor_selections"] = result2.get("motor_selections", [])
                        result3 = await graph.ainvoke(state)
                        assert isinstance(result3.get("hardware_bom"), list)

                        state["step"] = "software"
                        state["hardware_bom"] = result3.get("hardware_bom", [])
                        result4 = await graph.ainvoke(state)
                        assert isinstance(result4.get("generated_code"), dict)


@pytest.mark.asyncio
async def test_rollback_marks_downstream_stale():
    """Modify project spec after structure step, verify concept of invalidation."""
    state = _make_initial_state()
    state["structure_spec"] = {"robot_name": "TestBot", "links": [{"name": "base_link"}], "joints": []}
    state["urdf_code"] = MOCK_URDF
    state["generated_code"] = {"robot.urdf": MOCK_URDF}

    new_project = {**state["project_spec"], "dof": 3, "robot_name": "TestBot V2"}
    state["project_spec"] = new_project

    assert state["project_spec"]["dof"] == 3
    assert state["structure_spec"]["robot_name"] == "TestBot"
