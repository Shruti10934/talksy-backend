# Talksy - Backend

Talksy is a **real-time group chat application** built with **Node.js, Express, MongoDB, and Socket.IO**.  
This repository contains the backend API and WebSocket server for handling authentication, messaging, and group management.

---

## 🚀 Features

- 🔐 **User Authentication & Authorization** (JWT-based)
- 💬 **Real-time Messaging** using Socket.IO
- 👥 **Group Chats** (create, update, rename, delete groups)
- ✍️ **Typing Indicators**
- 🔄 **Infinite Scroll** for messages (pagination)
- 👤 **User Management** (search users, add/remove members)
- ☁️ **Cloudinary Integration** for profile pictures & media
- ⚡ **Scalable REST APIs** with error handling

---

## 🛠 Tech Stack

- **Node.js** – runtime
- **Express.js** – backend framework
- **MongoDB & Mongoose** – database & ODM
- **Socket.IO** – real-time communication
- **JWT (JSON Web Token)** – authentication
- **bcrypt.js** – password hashing
- **Cloudinary** – media storage
- **Multer** – file uploads

---

## ⚡ Real-time Events (Socket.IO)

- `connection` → Establish socket connection  
- `joinChat` → Join a chat room  
- `newMessage` → Broadcast new message to group  
- `typing` → Show typing indicator  
- `stopTyping` → Remove typing indicator  
- `disconnect` → Handle user disconnect  


