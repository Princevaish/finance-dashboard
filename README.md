#                         💰 Finance Dashboard System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)
![RBAC](https://img.shields.io/badge/Security-RBAC-red?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)

</div>

---

# 📌 Overview

Finance Dashboard System is a **production-grade full-stack fintech dashboard application** designed using modern frontend and backend technologies with scalable architecture principles.

The platform provides:

- Secure JWT authentication
- Role-Based Access Control (RBAC)
- Financial analytics dashboards
- Interactive charts and trends
- Financial record management
- Admin-level access control
- Responsive UI/UX
- RESTful API architecture

This project demonstrates real-world software engineering concepts including:

- Full-stack application development
- Secure authentication systems
- Scalable backend architecture
- Database modeling
- API development
- Deployment workflows
- Modern frontend engineering

---

# 🚀 Features

## 🔐 Authentication & Security

- JWT-based authentication
- Secure password hashing
- Protected API routes
- Role-Based Access Control (RBAC)
- Access token validation
- Secure backend architecture

---

## 📊 Dashboard & Analytics

- Interactive financial dashboard
- Revenue and trend analytics
- Chart.js visualizations
- KPI monitoring
- Financial insights
- Dynamic charts and statistics

---

## 🧾 Financial Records Management

- Create records
- Read records
- Update records
- Delete records
- Search functionality
- Category filtering
- Date range filtering

---

## 👨‍💼 Admin Controls

- User management
- Role management
- Permission handling
- Secure admin routes

---

## 🎨 Frontend Experience

- Responsive UI design
- GSAP animated landing page
- Modern fintech-inspired dashboard
- Optimized Next.js App Router architecture
- Reusable component system

---

# 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js 16, TypeScript |
| Styling | Tailwind CSS |
| Charts & Animations | Chart.js, GSAP |
| API Client | Axios |
| Backend | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 |
| Authentication | JWT |
| Authorization | RBAC |
| Validation | Pydantic |
| Database Migration | Alembic |
| Deployment | Vercel, Render |

---

# 🏗️ Architecture Overview

## Backend Architecture

```bash
backend/
│
├── api/               # API route handlers
├── services/          # Business logic layer
├── repositories/      # Database abstraction layer
├── models/            # SQLAlchemy database models
├── schemas/           # Pydantic validation schemas
├── core/              # Security & configuration
├── db/                # Database session management
├── migrations/        # Alembic migrations
└── main.py            # FastAPI application entry point
```

---

## Frontend Architecture

```bash
frontend/
│
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # Reusable components
│   ├── lib/           # Utilities & API functions
│   └── styles/        # Global styling
```

---

## Application Flow

```text
Client
   ↓
Frontend (Next.js)
   ↓
Axios API Requests
   ↓
FastAPI Backend
   ↓
Service Layer
   ↓
Repository Layer
   ↓
PostgreSQL Database
```

---

# 📸 Screenshots

> Add screenshots after deployment for portfolio showcasing.

## Landing Page

```md
![Landing Page](./screenshots/landing-page.png)
```

---

## Dashboard Analytics

```md
![Dashboard](./screenshots/dashboard.png)
```

---

## Charts & Trends

```md
![Analytics](./screenshots/analytics.png)
```

---

## Admin Panel

```md
![Admin Panel](./screenshots/admin-panel.png)
```

---

# ⚙️ Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/finance-dashboard-system.git

cd finance-dashboard-system
```

---

# 🔧 Backend Setup

## Navigate to Backend

```bash
cd backend
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 💻 Frontend Setup

## Navigate to Frontend

```bash
cd frontend
```

---

## Install Dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

## Backend `.env`

Create a `.env` file inside the backend directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_dashboard

SECRET_KEY=your_super_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

FRONTEND_URL=http://localhost:3000
```

---

## Frontend `.env.local`

Create a `.env.local` file inside the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

# 🗄️ Database Setup

## Create PostgreSQL Database

```sql
CREATE DATABASE finance_dashboard;
```

---

## Run Database Migrations

```bash
alembic upgrade head
```

---

# ▶️ Running the Project

## Start Backend Server

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

---

## Start Frontend Server

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# 📚 API Documentation

FastAPI automatically provides Swagger/OpenAPI documentation.

## Swagger UI

```text
http://localhost:8000/docs
```

---

## ReDoc

```text
http://localhost:8000/redoc
```

---

# 🔌 API Endpoint Examples

## Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |

---

## Financial Records Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/records` | Viewer / Analyst / Admin |
| POST | `/records` | Admin |
| PUT | `/records/{id}` | Admin |
| DELETE | `/records/{id}` | Admin |

---

## Admin Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/admin/users` | Admin |
| PUT | `/admin/roles/{id}` | Admin |

---

# 🔐 RBAC (Role-Based Access Control)

The application uses Role-Based Access Control to secure frontend pages and backend APIs.

---

## Roles & Permissions

| Role | Permissions |
|---|---|
| Viewer | View dashboard data only |
| Analyst | View analytics & records |
| Admin | Full CRUD access + user management |

---

## RBAC Workflow

```text
User Login
   ↓
JWT Token Generated
   ↓
Protected API Access
   ↓
Role Validation Middleware
   ↓
Authorized Response
```

---

# 📁 Folder Structure

```bash
finance-dashboard-system/
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── schemas/
│   ├── core/
│   ├── db/
│   ├── migrations/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   │
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── README.md
└── .gitignore
```

---

# 🌍 Deployment

## Frontend Deployment → Vercel

### Build Command

```bash
npm run build
```

### Deploy

```bash
vercel
```

---

## Backend Deployment → Render

### Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port 10000
```

---

## Production Environment Variables

Configure all backend and frontend environment variables inside:

- Render Dashboard
- Vercel Dashboard

---

# 🧪 Example Login Credentials

> Replace these demo credentials with your actual seeded users.

| Role | Email | Password |
|---|---|---|
| Viewer | viewer@example.com | password123 |
| Analyst | analyst@example.com | password123 |
| Admin | admin@example.com | password123 |

---

# 📈 Future Improvements

- Docker containerization
- CI/CD pipelines
- Refresh token authentication
- Redis caching
- WebSocket real-time analytics
- PDF/Excel export support
- AI-powered financial insights
- Unit & integration testing
- Multi-tenant architecture
- Audit logging system

---

# 🎓 Learning Outcomes

This project helped strengthen expertise in:

- Full-stack engineering
- FastAPI architecture
- Next.js App Router
- JWT authentication
- RBAC implementation
- PostgreSQL integration
- SQLAlchemy ORM
- API design principles
- Frontend-backend integration
- Secure application development
- Deployment workflows

---

# ⚡ Challenges Faced

## 🔐 Designing Secure RBAC

Implementing scalable role-based authorization while keeping the API architecture maintainable and secure.

---

## 🔄 Frontend & Backend Synchronization

Managing authentication state, token persistence, and protected routes across the frontend and backend.

---

## 🗄️ Database Design

Structuring normalized relational database schemas and handling migrations effectively using Alembic.

---

## 📊 Analytics Performance

Optimizing dashboard queries and chart rendering for smooth performance and better user experience.

---

# 📄 License

This project is licensed under the MIT License.

```text
MIT License © 2026
```

---

# 👨‍💻 Author

## Prince Vaish

Full Stack Developer | Backend-Focused Engineer | AI Enthusiast

### Connect With Me

- LinkedIn: https://linkedin.com/in/your-profile
- GitHub: https://github.com/your-username
- Portfolio: https://your-portfolio.com

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps showcase the project and supports future development.

---

# 📌 Final Notes

Finance Dashboard System was built to simulate a real-world fintech analytics platform using scalable backend architecture and modern frontend technologies.

The project focuses on:

- Production-level backend design
- Secure authentication systems
- Role-based authorization
- Modern dashboard UI/UX
- Real-world API workflows
- Scalable engineering practices
