# 🚀 DevConnect – Real-Time Social Media Platform

**DevConnect** is a full-stack social media platform built using the MERN stack that allows developers and users to connect, share posts, interact with content, and communicate through real-time messaging.

🌐 **Live Demo:** [DevConnect](https://devconnect-mocha.vercel.app/)

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure user registration and login.
- JWT-based authentication.
- Protected routes and user-specific access.
- Persistent login sessions.

### 📝 Social Media
- Create, edit, and delete posts.
- Like and comment on posts.
- Follow and unfollow other users.
- Personalized social feed.
- User profiles with profile pictures, cover photos, bio, skills, and location.

### 🎬 Reels
- Share and explore short-form video content.
- Interact with reels through likes and comments.
- Discover content from other users.

### 💬 Real-Time Messaging
- Real-time one-to-one chat using Socket.IO.
- Send text messages and images.
- Message editing, deletion, and reactions.
- Reply to messages.
- Read receipts and online status indicators.
- Pin messages and customize chat wallpapers.

### 🔔 Notifications
- Notifications for social interactions.
- Follow and engagement updates.
- Real-time notification updates.

### 📱 Responsive Design
- Modern and user-friendly interface.
- Responsive layout for desktop and mobile devices.
- Smooth navigation and interactive components.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Real-Time Communication | Socket.IO |
| Media Storage | Cloudinary |
| Deployment | Vercel, Render |
| Version Control | Git, GitHub |

---

## 🏗️ Project Architecture

```text
DevConnect/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── socket/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PrincePatel8602/Devconnect.git
cd Devconnect
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Configure your frontend environment variables according to your API configuration.

Start the frontend:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

## 🌍 Deployment

The application is deployed using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Media Storage:** Cloudinary

🔗 **Live Application:** https://devconnect-mocha.vercel.app/

---

## 🔒 Security

- JWT-based authentication.
- Protected API endpoints.
- Secure password handling.
- Environment variables for sensitive credentials.
- Authorized access to user-specific resources.

---


⭐ If you find this project interesting, consider giving it a star!

**Built with ❤️ using the MERN Stack.**
