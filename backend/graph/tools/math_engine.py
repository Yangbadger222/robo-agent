import numpy as np
import sympy as sp
from langchain_core.tools import tool


@tool
def calc_torque(
    mass_kg: float,
    arm_length_m: float,
    accel_rad_s2: float = 9.81,
    safety_factor: float = 2.0,
) -> dict:
    """Calculate required torque for a robotic joint given mass, arm length, acceleration, and safety factor."""
    torque = mass_kg * arm_length_m * accel_rad_s2 * safety_factor

    m, L, a, sf = sp.symbols("m L a SF")
    formula = sp.Eq(sp.Symbol("τ"), m * L * a * sf)

    return {
        "torque_nm": float(torque),
        "formula": str(formula),
        "inputs": {
            "mass_kg": mass_kg,
            "arm_length_m": arm_length_m,
            "accel_rad_s2": accel_rad_s2,
            "safety_factor": safety_factor,
        },
    }


@tool
def calc_inertia(
    mass_kg: float,
    length_m: float,
    shape: str = "cylinder",
    radius_m: float = 0.025,
) -> dict:
    """Calculate moment of inertia for a link given its mass, length, shape, and radius."""
    shape = shape.lower()
    if shape == "cylinder":
        inertia = (1 / 12) * mass_kg * (3 * radius_m**2 + length_m**2)
        formula = "I = (1/12) * m * (3*r² + L²)"
    elif shape == "box":
        inertia = (1 / 12) * mass_kg * (length_m**2 + (2 * radius_m) ** 2)
        formula = "I = (1/12) * m * (L² + w²)"
    elif shape == "sphere":
        inertia = (2 / 5) * mass_kg * radius_m**2
        formula = "I = (2/5) * m * r²"
    else:
        raise ValueError(f"Unsupported shape: {shape}. Use 'cylinder', 'box', or 'sphere'.")

    return {
        "inertia_kg_m2": float(inertia),
        "shape": shape,
        "formula": formula,
    }


@tool
def calc_pid_gains(
    natural_freq: float,
    damping_ratio: float = 0.7,
    inertia: float = 1.0,
) -> dict:
    """Calculate PID controller gains from natural frequency, damping ratio, and inertia."""
    kp = inertia * natural_freq**2
    kd = 2 * damping_ratio * natural_freq * inertia
    ki = kp * 0.1

    return {
        "kp": float(kp),
        "ki": float(ki),
        "kd": float(kd),
    }
