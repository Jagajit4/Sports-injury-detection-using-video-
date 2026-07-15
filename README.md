# AI-Powered Sports Injury Risk Detection Using Video

## Project Overview

The AI-Powered Sports Injury Risk Detection Platform analyzes athlete movement videos to identify biomechanical abnormalities, estimate injury risks, and provide corrective recommendations before injuries occur.

The system combines Computer Vision, Pose Estimation, Biomechanics Analysis, and Machine Learning to help athletes, coaches, physiotherapists, and sports scientists improve performance while reducing injury risks.

---

## Features

### Completed (Milestone 1)

- User Registration
- User Login
- JWT Authentication
- Protected Dashboard
- Secure Password Hashing
- SQLite Database Integration
- REST API using FastAPI
- React Frontend
- React Router Navigation
- Backend–Frontend Integration

### Planned (Milestone 2 & Beyond)

- Video Upload
- Pose Estimation
- Human Skeleton Detection
- Joint Angle Calculation
- Movement Analysis
- Injury Risk Prediction
- Corrective Feedback
- Report Generation

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios

### Backend

- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Passlib (bcrypt)

### AI & Computer Vision (Upcoming)

- OpenCV
- MediaPipe
- Scikit-learn
- TensorFlow / PyTorch

---

## Project Structure

```
Sports-injury-detection-using-video-
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── sports_injury.db
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── datasets/
│
├── docs/
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd Sports-injury-detection-using-video-
```

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```
http://127.0.0.1:8000
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## Authentication

- Register a new account
- Login with email and password
- JWT token generation
- Protected Dashboard
- Logout functionality

---

## Future Scope

- Real-time athlete monitoring
- Injury prediction using machine learning
- Coach dashboard
- Physiotherapist dashboard
- Injury analytics
- Cloud deployment

---

## Team

Project developed as part of the **AI-Powered Sports Injury Risk Detection Platform**.