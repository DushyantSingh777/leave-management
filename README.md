# LeaveFlow — Leave Management System

A full-stack Leave Management System built with **Vue.js**, **Node.js/Express**, and **MongoDB Atlas**.

🔗 **Live App:** https://leave-management-nu-jade.vercel.app  
📦 **Backend API:** https://your-backend.onrender.com

---

## Features

### Employee
- Register / Login as Employee
- Apply for leave (Type, Start Date, End Date, Reason)
- View leave requests with status (Pending / Approved / Rejected)
- Cancel pending leave requests

### Employer
- Register / Login as Employer
- View all employee leave requests
- Approve or Reject with optional note
- Dashboard with stats

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Vue Router, Pinia |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Auth | JWT, bcryptjs |
| Database | MongoDB Atlas (Mongoose) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure
```
leave-management/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── leaveController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Leave.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── leaves.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── views/
        │   ├── employee/
        │   └── employer/
        ├── components/
        ├── store/
        └── router/
```
---

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/DushyantSingh777/leave-management.git
cd leave-management
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev
```

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/leave_management
JWT_SECRET=your_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login and get JWT token |
| GET | `/me` | Get current user |

### Leaves — `/api/leaves`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Employee | Apply for leave |
| GET | `/my` | Employee | Get own leave requests |
| DELETE | `/:id` | Employee | Cancel a pending request |
| GET | `/all` | Employer | Get all leave requests |
| GET | `/stats` | Employer | Get statistics |
| PATCH | `/:id/review` | Employer | Approve or Reject |

---

## Deployment

### Backend → Render.com
- Root Directory: `backend`
- Build Command: `yarn`
- Start Command: `npm start`
- Add env vars: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`

### Frontend → Vercel
- Root Directory: `frontend`
- Framework: Vite
- Add env var: `VITE_API_BASE_URL`
