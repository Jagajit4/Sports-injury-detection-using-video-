import cv2
import mediapipe as mp

from .injury_analysis import calculate_angle
from .injury_analysis import predict_risk

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()


def process_video(video_path):

    cap = cv2.VideoCapture(video_path)

    frames = 0
    pose_frames = 0

    knee_angles = []

    while cap.isOpened():

        success, frame = cap.read()

        if not success:
            break

        frames += 1

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        results = pose.process(rgb)

        if results.pose_landmarks:

            pose_frames += 1

            landmarks = results.pose_landmarks.landmark

            hip = (
                landmarks[mp_pose.PoseLandmark.LEFT_HIP].x,
                landmarks[mp_pose.PoseLandmark.LEFT_HIP].y,
            )

            knee = (
                landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x,
                landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y,
            )

            ankle = (
                landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x,
                landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y,
            )

            angle = calculate_angle(
                hip,
                knee,
                ankle
            )

            knee_angles.append(angle)

    cap.release()

    if knee_angles:

        average_angle = round(
            sum(knee_angles) / len(knee_angles),
            2
        )

        risk = predict_risk(average_angle)

    else:

        average_angle = 0

        risk = "Unknown"

    return {

        "frames_processed": frames,

        "pose_detected_frames": pose_frames,

        "average_knee_angle": average_angle,

        "injury_risk": risk

    }