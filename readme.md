# 🚀 MERN LMS - FYP Project

Welcome to the MERN LMS repository for our Final Year Project. Follow the steps below to run the project locally on your machine.

## 📋 Prerequisites
Before you start, make sure you have these installed on your device:
1. **Node.js** (Download from nodejs.org)
2. **Git** (Download from git-scm.com)
3. **MongoDB Community Server / Compass** (Since our database is currently local, you must have MongoDB running on your machine to start the server).

---

## 🛠️ Local Setup Guide

### Step 1: Clone the Repository
Open your terminal and run:
\`\`\`bash
git clone https://github.com/kaslama/LMS.git
cd LMS
\`\`\`

### Step 2: Set Up the Backend (Server)
The backend handles our API and database connection. Open a terminal in the `server` folder:
\`\`\`bash
cd server
npm install
\`\`\`

**CRITICAL STEP:** Create a new file named exactly **`.env`** inside the `server` folder. Paste the following configuration into it:
\`\`\`env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mern_lms
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
\`\`\`

Start the backend server:
\`\`\`bash
npm run dev
\`\`\`
*(Leave this terminal running! It should say connected to MongoDB.)*

### Step 3: Set Up the Frontend (Client)
The frontend contains our React UI. Open a **new, separate terminal window**, and navigate to the `client` folder:
\`\`\`bash
cd client
npm install
\`\`\`

Start the React application:
\`\`\`bash
npm run dev
\`\`\`
*(Leave this terminal running as well!)*

### Step 4: View the Project
Once both terminals are running without errors, open your browser and go to:
👉 **http://localhost:5173**

---

## ⚠️ Troubleshooting Notes for the Team
* If you get a "MongoDB connection error" in the backend terminal, make sure your local MongoDB service is actually running.
