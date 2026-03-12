import py_compile
import tempfile
import os
import xml.etree.ElementTree as ET

from graph.state import AgentState


async def validator_node(state: AgentState) -> dict:
    errors = []
    generated = state.get("generated_code") or {}

    for filename, code in generated.items():
        if filename.endswith(".py"):
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
                    f.write(code)
                    tmp_path = f.name
                py_compile.compile(tmp_path, doraise=True)
            except py_compile.PyCompileError as e:
                errors.append(f"{filename}: {e}")
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    os.unlink(tmp_path)
        elif filename.endswith((".urdf", ".xml")):
            try:
                ET.fromstring(code)
            except ET.ParseError as e:
                errors.append(f"{filename}: XML parse error: {e}")

    iteration = (state.get("iteration") or 0) + 1
    return {"errors": errors, "iteration": iteration}
