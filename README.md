# eLearning Platform

A comprehensive eLearning platform featuring Student Learning, Mentor Dashboard, and Admin Control.

## Architecture

The project is split into two main folders:
- **frontend/**: React + Vite application (User Interface)
- **backend/**: Node.js + Express application (API & S3 Proxy)

## Prerequisites

- **Node.js** (v14 or higher)
- **Firebase Account** (Authentication & Firestore)
- **AWS S3 Account** (File Storage)

## Environment Setup

### Backend (.env)
Create `backend/.env` with:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=technosoft-elearning-assets
PORT=5000
```

### Frontend (.env)
Create `frontend/.env` with:
```env
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=dcvcfiqpl
VITE_CLOUDINARY_UPLOAD_PRESET=elearning-uploads
```
*(Note: Cloudinary keys are kept for legacy compatibility but S3 is the primary storage).*

## How to Run Locally

1.  **Install Dependencies** (Root)
    ```bash
    npm install
    ```
    This will automatically install dependencies for both `frontend` and `backend`.

2.  **Start Development Servers**
    ```bash
    npm run dev
    ```
    This command uses `concurrently` to start both the Backend (Port 5000) and Frontend (Port 5173).

3.  **Access Application**
    Open your browser and navigate to:
    `http://localhost:5173`

## Features

- **Students**: Browse courses, enroll (payment pending), view content (videos, PDFs), chat, manage profile.
- **Mentors**: Create courses, upload content (S3), manage blogs, view earnings, verify payments.
- **Admin**: Dashboard (`/admin`), manage users, mentors, financials.

## Troubleshooting

- **Upload Failed?** Ensure the Backend server is running on port 5000 and AWS keys are correct.
- **Login Issues?** Ensure Firebase configuration in `src/firebase.js` (Frontend) is valid.
# Technosoft-elearning-products
