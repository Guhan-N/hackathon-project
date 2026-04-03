# 🚀 CollabDocs
### Seamless, Precision Real-Time Collaboration

**Live URL**: [project-8io14.vercel.app](https://project-8io14.vercel.app)

---

## 📄 Overview

**CollabDocs** is a professional-grade, high-performance collaborative editing platform. Engineered for teams that require near-zero latency, it uses **Conflict-free Replicated Data Types (CRDTs)** to ensure that your work is synchronized perfectly, every time, without collisions.

---

## ✨ Key Features

> [!TIP]
> **Experience the Sync**: Open the application in two different browsers (or an incognito window) to see the lightning-fast, real-time collaboration in action!

| Feature | Description |
| :--- | :--- |
| 🔄 **Real-Time Sync** | Precision synchronization powered by Yjs and WebSockets. |
| 🌓 **Persistent Theme** | Full Dark/Light mode with local persistence and CSS variables. |
| 🔒 **Security-First** | Private, password-protected documentation gates and JWT Auth. |
| 📂 **Pro Exporter** | One-click downloads for **PDF**, **Word (.doc)**, and **Plain Text**. |
| 👥 **Presence UI** | High-fidelity collaborator status and real-time cursor tracking. |

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS (Custom Design System)
- **Editor**: Tiptap Rich Text Framework
- **Icons**: Lucide React (Premium Iconography)
- **Sync**: Yjs & y-websocket-client

### **Backend**
- **Runtime**: Node.js & Express
- **Database**: MongoDB Atlas (Cloud)
- **Real-time**: Custom y-websocket-server implementation
- **Security**: JSON Web Tokens (JWT) & bcrypt

---

## 🏗️ Architecture Overview

CollabDocs utilizes a **Distributed State** model to ensure performance:

1. **Local Mutations**: Every client maintains an independent Y.Doc (CRDT). Edits are reflected locally *instantly*, providing a zero-latency feel.
2. **Binary Broadcasts**: Local changes are encoded into highly efficient binary updates and broadcasted via WebSockets.
3. **Optimistic-to-Consistent**: Changes are merged optimistically and reach eventual consistency across all clients automatically.

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js** (v18 or higher)
- **MongoDB Atlas** Account

---

### **1. Backend Setup**

```bash
cd server
npm install
```

**Required `.env` Variables**:
```bash
MONGO_URI=your_mongodb_atlas_string
JWT_SECRET=your_secure_random_key
```

```bash
npm start
```

---

### **2. Frontend Setup**

```bash
cd client
npm install
```

**Required `.env` Variables**:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

```bash
npm run dev
```

---

## 🤖 AI Tools Used (MANDATORY)

> [!IMPORTANT]
> **Full Disclosure**: In compliance with the AI Tool Policy, the following tools were utilized during the development of this project:

- **Antigravity (Google Deepmind)**: Acts as the primary full-stack implementation agent.
    - **CRDT Architecture**: Guided the implementation of the Yjs synchronization engine.
    - **UI/UX Design**: Engineered the persistent Dark/Light mode and the "Pro" Export Dropdown system.
    - **Security**: Architected the Password Gate and verification logic.

---

## ⚠️ Known Limitations

- **Media Support**: Large image and video embedding is currently in active development.
- **Cursor Sync**: User cursor colors are randomized per session and do not yet persist across logouts.
- **Advanced Tables**: Deep cell merging/splitting operations are coming in a future update.

---

## 📄 License
This project is for hackathon submission purposes and is licensed for personal evaluation.
