# CivicFix 🏙️

**AI-Ready Smart Municipal Grievance Redressal & Civic Complaint Management Platform**

---

## 🌟 Overview

**CivicFix** is an end-to-end civic complaint management platform designed to connect citizens, municipal authorities, and ground officers in a unified workflow. From pothole detection to resolution proof, CivicFix provides real-time tracking, automated SLA monitoring, geographic hotspots, citizen ratings, and verifiable before/after evidence.

---
Live:https://civicfix-frontend-hatx.onrender.com

## ✨ Features

### 👤 Citizen Portal
- **Secure Authentication**: JWT-based user registration and login.
- **Problem Reporting**: Report potholes, garbage, street lights, water leaks, drainage, traffic signals, and public property issues.
- **Evidence Upload**: Photo upload with GPS location capture.
- **Smart Tracking**: Real-time 4-step progress stepper (**Submitted → Assigned → In Progress → Resolved**).
- **Public Complaint Tracking**: Track any issue by Tracking ID (`CF-2026-XXXX`) without logging in, with complete privacy safeguards (no citizen personal information or exact GPS coords exposed).
- **QR Code Tracking**: Scan dynamic QR codes generated per complaint to immediately track progress.
- **Downloadable PDF Receipts**: Generate official, downloadable PDF receipts with full complaint and resolution details.
- **Citizen Rating & Reviews**: Post-resolution 5-star rating system with comments to score municipal service quality.
- **Real-Time Notifications**: Instant updates when complaints change status, get assigned, or receive officer comments.

### 👷 Officer Dashboard
- **Role-Based Workspace**: Clean interface isolated strictly for field officers.
- **Assigned Jobs**: Live dashboard of assigned civic grievances.
- **Status Progression**: Move complaints from Assigned to In Progress to Resolved.
- **Resolution Proof**: Upload "After Repair" proof photos and resolution notes before completing work.

### 👨‍💼 Municipal Admin Command Center
- **Key Metrics**: Total Complaints, Pending, Assigned, In Progress, Resolved, Critical, Breached/Overdue SLAs.
- **Performance Analytics**: Real-time Resolution Rate (%) and Citizen Rating (⭐).
- **Interactive Live Map**: Leaflet-powered map displaying active complaint pins and status markers.
- **Department & Officer Workload**: Live progress bars tracking workload per department and individual staff officer.
- **Advanced Search & Filtering**: Multi-parameter filter across Search text, Status, Priority, Category, Date, and Active/Resolved status.
- **Officer Assignment**: Assign department and dispatch specific active field officers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Axios, Leaflet, React-Leaflet, Recharts, Bootstrap 5, Bootstrap Icons, qrcode.react |
| **Backend** | Python 3, Django 6, Django REST Framework (DRF), SimpleJWT, ReportLab, Pillow |
| **Database** | SQLite / MySQL |
| **Security** | Role-Based Access Control (RBAC), Sanitized Public Serializers, Protected Routes, JWT Auth |

---

## 👥 User Roles

1. **Citizen**: Normal registered user who reports problems, tracks progress, downloads receipts, and provides feedback.
2. **Officer**: Field officer who receives assignments, updates work status, and submits resolution proof.
3. **Admin**: Municipal supervisor with complete command center access, map oversight, assignment controls, and analytics.

---

## 🔄 Complaint Lifecycle Flow

```text
Citizen Reports Problem (Photo + GPS Location)
                     ↓
        Unique Complaint ID Generated (CF-2026-XXXX)
                     ↓
        Admin Review in Command Center & Priority Set
                     ↓
    Department Assigned & Officer Dispatched (Notifications Sent)
                     ↓
        Officer Starts Work (Status: In Progress)
                     ↓
      SLA Timer Countdown Monitored (48 Hours Target)
                     ↓
Officer Uploads "After Repair" Photo Proof & Resolution Notes
                     ↓
             Status: Resolved
                     ↓
Citizen Receives Notification & Reviews Before / After Evidence
                     ↓
        Citizen Downloads PDF Receipt & Scans QR
                     ↓
     Citizen Submits 1–5 Star Rating & Redressal Feedback
                     ↓
  Admin Command Center Performance Metrics Update in Real-Time
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt   # or: pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow reportlab
python manage.py migrate
python manage.py runserver
```

Backend will run at: `http://127.0.0.1:8000/`

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173/`

---

## 📄 License
This project is developed for civic enhancement and municipal transparency under the MIT License.

