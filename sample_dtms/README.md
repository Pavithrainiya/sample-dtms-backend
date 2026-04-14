# Digital Talent Management System (DTMS) 🚀

A production-ready web application designed for comprehensive talent management. Administrators can seamlessly assign, review, and evaluate tasks, while users can track their progress and submit deliverables within intuitive, role-based dashboards.

## 🛠️ Technology Stack
- **Frontend**: React.js (Vite), Tailwind CSS v4, Lucide Icons
- **Backend**: Django REST Framework, SimpleJWT Auth
- **Database**: MySQL

## ✨ Core Features
- **JWT Authentication**: Secure login and registration with token refresh capabilities.
- **Enterprise Role-Based Access (RBAC)**: Distinct interfaces for Administrators and Users.
- **Interactive Dashboards**: Real-time analytical statistics, task filtering, and responsive search algorithms.
- **Premium UI/UX**: Dynamic gradient styling, micro-animations, and Toast notifications for seamless interactions.

## 🎯 Quick Start Guide

### 1. Backend Setup (Django)
Navigate to the \`backend\` directory and set up your virtual environment.
\`\`\`bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
\`\`\`

### 2. Frontend Setup (React)
Navigate to the \`frontend\` directory.
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 🌐 API Endpoints Reference
- \`POST /api/auth/login/\` - Obtain JWT Token
- \`POST /api/auth/register/\` - Register Account
- \`GET /api/tasks/tasks/\` - Fetch Tasks
- \`POST /api/tasks/submissions/\` - Submit Assigned Work

---

*Developed as a Full Stack Individual Build Sprint Project.*
