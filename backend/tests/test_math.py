from graph.tools.math_engine import calc_torque, calc_inertia, calc_pid_gains


def test_calc_torque():
    result = calc_torque.invoke({"mass_kg": 1.0, "arm_length_m": 0.5, "accel_rad_s2": 9.81, "safety_factor": 2.0})
    assert abs(result["torque_nm"] - 9.81) < 0.01


def test_calc_inertia_cylinder():
    result = calc_inertia.invoke({"mass_kg": 2.0, "length_m": 0.3, "shape": "cylinder", "radius_m": 0.05})
    assert result["inertia_kg_m2"] > 0
    assert result["shape"] == "cylinder"


def test_calc_inertia_sphere():
    result = calc_inertia.invoke({"mass_kg": 1.0, "length_m": 0.1, "shape": "sphere", "radius_m": 0.1})
    assert result["inertia_kg_m2"] > 0


def test_calc_pid_gains():
    result = calc_pid_gains.invoke({"natural_freq": 10.0, "damping_ratio": 0.7, "inertia": 1.0})
    assert abs(result["kp"] - 100.0) < 0.01
    assert abs(result["kd"] - 14.0) < 0.01
    assert abs(result["ki"] - 10.0) < 0.01
