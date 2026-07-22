import math


def calculate_angle(a, b, c):
    """
    Calculate angle between three points.
    """

    ax, ay = a
    bx, by = b
    cx, cy = c

    ba = (ax - bx, ay - by)
    bc = (cx - bx, cy - by)

    dot = ba[0] * bc[0] + ba[1] * bc[1]

    mag1 = math.sqrt(ba[0] ** 2 + ba[1] ** 2)
    mag2 = math.sqrt(bc[0] ** 2 + bc[1] ** 2)

    if mag1 == 0 or mag2 == 0:
        return 0

    angle = math.degrees(
        math.acos(dot / (mag1 * mag2))
    )

    return angle


def predict_risk(knee_angle):

    if knee_angle < 70:
        return "High"

    elif knee_angle < 120:
        return "Medium"

    return "Low"