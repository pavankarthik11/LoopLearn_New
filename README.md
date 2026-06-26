# 🌟 LoopLearn

**A peer-to-peer skill exchange platform** where users can **swap skills** for free or **learn from others** for a fee. Think of it as a marketplace for knowledge — you teach what you know, and learn what you don't.

---

## 📸 Overview

LoopLearn connects learners and teachers through a matchmaking system. Users create profiles with their skills, set hourly rates, and explore others' offerings. They can send **Swap requests** (mutual skill exchange) or **Paid Learn requests** (pay to learn). The platform includes messaging, reviews, notifications, rich content creation, video integrations, and UPI-based payments with QR code generation.

---

## 🏗️ Tech Stack

| Layer        | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7                           |
| **Backend**  | Node.js, Express 5, Mongoose (MongoDB Atlas)                               |
| **Auth**     | Custom JWT / Clerk Auth integration, bcrypt password hashing               |
| **Email**    | Nodemailer / Resend — OTP verification, password reset                     |
| **Storage**  | Cloudinary (avatar/media uploads via Multer)                               |
| **Payments** | UPI QR code generation (via `qrcode` library)                              |
| **Rich Media**| React YouTube, Quill (rich text editing), React TS Particles (animations)  |

---

## 📁 Project Structure

```
LoopLearn/
├── Backend/                    # Express.js REST API
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express route definitions
│   │   ├── middlewares/        # Auth & file upload middlewares
│   │   ├── utils/              # ApiError, ApiResponse, Cloudinary utils
│   │   ├── db/                 # MongoDB connection logic
│   │   ├── index.js            # Server entry point
│   ├── public/temp/            # Temporary file uploads
│   ├── .env.example            # Environment variable template
│   └── package.json
│
├── Frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page-level components
│   │   ├── context/            # Global state & context
│   │   ├── assets/             # Icons, images
│   │   ├── App.jsx             # Router setup
│   │   ├── main.jsx            # App entry point
│   │   └── index.css           # Global styles
│   ├── .env.example            # Environment variable template
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
├── .gitignore                  
└── README.md                   # You are here
```

---

## ✨ Features

### 👤 User Management & Authentication
- **Registration** with avatar upload, email/OTP verification
- **Authentication** supported by JWT access + refresh tokens & Clerk integration
- **Profile editing** — bio, location, social links, avatar update
- **Public user profiles** by username

### 🎯 Skill & Course System
- Users can **offer skills** with descriptions, rates, and highlights
- **Rich content creation** utilizing Quill editor for detailed skill/course descriptions
- **Video integration** via React YouTube to embed learning materials
- Browse all skill offerings on the **Explore** page

### 🤝 Match Requests
- **Swap Request** — free mutual skill exchange
- **Paid Learn Request** — pay-to-learn with agreed price
- Accept / Reject / Cancel request workflow
- View received & sent requests with status tracking

### 💬 Messaging & Notifications
- Direct messaging between matched users
- **Automated Notifications** powered by Node-cron for scheduled tasks and reminders
- In-app alerts for match requests, payments, reviews
- Mark as read / delete functionality

### ⭐ Reviews & Ratings
- Leave reviews (1-5 stars + comment) on skill offerings
- Average ratings auto-calculated per skill and per user
- Visual star ratings built with React Simple Star Rating

### 💳 Payments
- UPI-based payment flow for paid learning sessions
- QR code generation for payment links via `qrcode`
- Payment status tracking (Requested → UPI Provided → Paid)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (for image uploads)
- **Clerk** account (if using Clerk auth)
- **Resend** or **Gmail App Password** (for emails)

### 1. Clone the Repository
```bash
git clone https://github.com/pavankarthik11/LoopLearn_New.git
cd LoopLearn_New
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create your `.env` file by copying the template:
```bash
cp .env.example .env
```

Fill in the required values in `Backend/.env`:
| Variable | Description |
|----------|-------------|
| `PORT` | The port the backend will run on (default: 8000) |
| `BASE_URL` | The base URL of the backend (default: http://localhost:8000) |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `CORS_ORIGIN` | The URL of your frontend (e.g., http://localhost:5173 for local) |
| `ACCESS_TOKEN_SECRET` | Secret for JWT access tokens |
| `ACCESS_TOKEN_EXPIRY` | Expiry time (e.g., 1d) |
| `REFRESH_TOKEN_SECRET` | Secret for JWT refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | Expiry time (e.g., 10d) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary configuration |
| `CLOUDINARY_API_KEY` | Cloudinary configuration |
| `CLOUDINARY_API_SECRET` | Cloudinary configuration |
| `GMAIL_USER` | Your Gmail address for sending OTPs |
| `GMAIL_PASS` | Gmail App Password |
| `RESEND_API_KEY` | Resend API key (optional) |
| `RESEND_FROM_EMAIL` | Sender email address for Resend |
| `DAILY_API_KEY` | Daily.co API key for video calls |

Start the backend:
```bash
npm run dev       # Development mode (nodemon)
npm start         # Production mode
```
The server runs on **http://localhost:8000** by default.

### 3. Frontend Setup
```bash
cd Frontend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Fill in `Frontend/.env`:
| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk authentication publishable key |
| `VITE_CURRENCY` | Currency symbol (default: `$`) |
| `VITE_BACKEND_URL` | Backend API URL (default: `http://localhost:8000`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for direct frontend uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET`| Cloudinary unsigned upload preset |

Start the frontend:
```bash
npm run dev
```
The app runs on **http://localhost:5173** by default.

---

## 🔌 API Endpoints
*(Key endpoints summary - see source for full list)*

- **Auth**: `/api/users/register`, `/login`, `/logout`, `/me`
- **Skills**: `/api/skills` (GET, POST, PUT, DELETE)
- **Match Requests**: `/api/match-requests/swap`, `/paid`, `/sent`, `/received`
- **Messages**: `/api/messages`, `/:userId`
- **Reviews**: `/api/reviews`
- **Notifications**: `/api/notifications`
- **Transactions**: `/api/transactions`, `/request-payment`, `/submit-upi`

---

## 🗄️ Database Models

| Model | Key Fields |
|-------|------------|
| **User** | username, email, fullName, avatar, password, skillsOffered, skillsWanted |
| **SkillOffer** | user, skillName, description, experienceLevel, hourlyRate, highlights |
| **MatchRequest** | sender, receiver, requestedSkill, requestType, status, paymentStatus, upiId |
| **Message** | sender, receiver, content, type, isRead |
| **Review** | skillOffer, reviewer, rating, comment |
| **Notification** | recipient, type, message, isRead, linkTo |
| **Transaction** | payer, payee, amount, relatedRequest, status |

---

## 🌐 Deployment

### Backend (Render / Railway / Fly.io)
- Root directory: `Backend`
- Build command: `npm install`
- Start command: `npm start`
- Ensure all environment variables are set.

### Frontend (Vercel / Netlify)
- Root directory: `Frontend`
- Build command: `npm run build`
- Ensure `VITE_BACKEND_URL` is set to the deployed backend URL.

---

## 🛡️ Security Notes
- **Never commit `.env` files**.
- Passwords are hashed with **bcrypt**.
- JWT tokens are stored securely in **httpOnly cookies**.

---

## 📄 License
This project is for educational / portfolio purposes. Feel free to fork and modify.

---

## 👨‍💻 Author
**Sai Pavan Karthik** — Full-Stack Developer
- 🔗 GitHub: [@pavankarthik11](https://github.com/pavankarthik11)
