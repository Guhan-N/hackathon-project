# CollabDocs 🚀
### High-Performance Real-Time Collaborative Text Editor

**Live URL**: [project-8io14.vercel.app](https://project-8io14.vercel.app)

CollabDocs is a professional-grade, real-time collaborative editing platform engineered for seamless teamwork. By leveraging **Conflict-free Replicated Data Types (CRDTs)**, CollabDocs ensures high-availability and zero-collision synchronization across multiple users, providing a smooth, "Google Docs-like" experience with a premium, developer-focused aesthetic.

---

## ✨ Key Features

- 🔄 **Real-Time Collaboration**: Powered by Yjs and WebSockets for near-instant synchronization and conflict resolution.
- 🌓 **Persistent Dark Mode**: Sophisticated theme management using CSS variables and `localStorage` for a consistent UI across sessions.
- 🔒 **Secure Password Gates**: Private document support with robust password protection and JWT-based authentication.
- 📂 **Multi-Format Export**: One-click professional exports to **PDF**, **Word (.doc)**, and **Plain Text (.txt)**.
- 👥 **Presence Indicators**: Visual cues showing active collaborators and their cursor movements (Presence aware).
- 📱 **Responsive Design**: Full-fidelity experience across Desktop, Tablet, and Mobile devices.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: High-performance frontend framework.
- **Tailwind CSS**: Utility-first styling with a custom dark-mode design system.
- **Lucide React**: Premium iconography for a "Pro" look.
- **Tiptap Framework**: Headless rich-text editor framework for deep customization.
- **Yjs & y-websocket**: CRDT-based shared data types for real-time sync.

### Backend
- **Node.js & Express**: Scalable server-side architecture.
- **MongoDB Atlas**: Cloud-native database for document metadata and user authentication.
- **y-websocket-server**: Custom WebSocket implementation for handling shared document states.
- **JWT (JSON Web Tokens)**: Secure, stateless authentication for session management.

---

## 🏗️ Architecture Overview

CollabDocs follows a distributed state-management architecture:

1. **Client-Side**: Every client maintains a local Y.Doc (CRDT). Changes are immediately reflected in the local UI for zero perceived latency.
2. **WebSocket Synchronization**: Local changes are encoded as binary updates and broadcasted to the backend via `y-websocket`.
3. **Server-Side**: The central WebSocket server acts as a relay, broadcasting updates to all other connected clients and periodically persisting metadata to MongoDB.
4. **Conflict Resolution**: Conflict-free Replicated Data Types naturally merge updates from different users without requiring a central "source of truth" to arbitrate edits.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (for `MONGO_URI`)

### Backend Setup
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Fill in your environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for authentication.
5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   VITE_WS_URL=ws://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🤖 AI Tools Used

This project was developed with the assistance of the following AI tools:

- **Antigravity (Google Deepmind)**: A powerful agentic coding assistant used as the primary pair programmer.
    - **Implementation**: Architected the Yjs synchronization layer and real-time WebSocket communication.
    - **UI/UX**: Designed the persistent Dark/Light mode system and the responsive multi-format export dropdown.
    - **Logic**: Engineered the secure document Password Gate and JWT authentication flow.

---

## ⚠️ Known Limitations

- **Media Embedding**: Direct image and video embedding is currently in development.
- **Advanced Tables**: Complex table operations (merging/splitting cells) are not yet fully supported.
- **Cursor Persistence**: User cursor colors are randomized per session and do not yet persist across total logout/login cycles.

---

## 📄 License
This project is for hackathon submission purposes.
