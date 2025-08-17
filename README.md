# Real‑Time Chat (Socket.IO + Express)

## Quick start
1) Install Node.js (v18+).
2) In a terminal:
```bash
npm install
npm start
```
3) Open http://localhost:3000 in two browser tabs, enter usernames and start chatting.
4) Use the "Room" field to create/join rooms (e.g., `college`, `friends`).

## Features
- Real-time messages
- Rooms
- User list / presence
- Typing indicator
- In-memory chat history (resets when server restarts)

## Deploy (Replit)
- Create a new Replit (Node.js), upload these files, click Run.
- Replit will give you a public URL you can share.

## Notes
- History is stored in memory only for simplicity. For persistence, connect a database (MongoDB, PostgreSQL).