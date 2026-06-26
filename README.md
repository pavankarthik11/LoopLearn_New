# 🔄 LoopLearn

**A peer-to-peer skill exchange platform** where users can **swap skills** for free or **learn from others** for a fee. Think of it as a marketplace for knowledge — you teach what you know, and learn what you don't.

### 🌐 [Live Demo → loop-learn-five.vercel.app](https://loop-learn-five.vercel.app/)

---

## 📸 Overview

LoopLearn connects learners and teachers through a matchmaking system. Users create profiles with their skills, set hourly rates, and explore others' offerings. They can send **Swap requests** (mutual skill exchange) or **Paid Learn requests** (pay to learn). The platform includes messaging, reviews, notifications, and UPI-based payments with QR code generation.

---

## 🏗️ Tech Stack

| Layer        | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v7                             |
| **Backend**  | Node.js, Express 5, Mongoose (MongoDB Atlas)                              |
| **Auth**     | Custom JWT (Access + Refresh tokens), bcrypt password hashing             |
| **Email**    | Nodemailer (Gmail SMTP) — OTP verification, password reset                |
| **Storage**  | Cloudinary (avatar/image uploads via Multer)                              |
| **Payments** | UPI QR code generation (via `qrcode` library)                             |
| **Styling**  | Tailwind CSS v3, Outfit font (Google Fonts)                               |

---

## 📁 Project Structure

```
LoopLearn/
├── Backend/                    # Express.js REST API
│   ├── src/
│   │   ├── controllers/        # Route handlers (user, skill, match, message, etc.)
│   │   ├── models/             # Mongoose schemas (User, SkillOffer, MatchRequest, etc.)
│   │   ├── routes/             # Express route definitions
│   │   ├── middlewares/        # Auth (JWT) & Multer (file upload) middleware
│   │   ├── utils/              # ApiError, ApiResponse, asyncHandler, Cloudinary
│   │   ├── db/                 # MongoDB connection logic
│   │   ├── app.js              # Express app setup (CORS, routes, error handlers)
│   │   ├── index.js            # Server entry point
│   │   └── constants.js        # Database name constant
│   ├── public/temp/            # Temporary file uploads (gitignored)
│   ├── .env.example            # Environment variable template
│   └── package.json
│
├── Frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/student/ # Reusable UI components (Navbar, Footer, UserCard, etc.)
│   │   ├── pages/student/      # Page-level components (Home, Login, Register, etc.)
│   │   ├── context/            # AppContext (global state, auth, API calls)
│   │   ├── assets/             # SVG icons, images, dummy data
│   │   ├── App.jsx             # Router setup
│   │   ├── main.jsx            # App entry point
│   │   └── index.css           # Global styles + Tailwind directives
│   ├── .env.example            # Environment variable template
│   ├── index.html              # HTML entry point
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
├── .gitignore                  # Root gitignore (covers entire repo)
└── README.md                   # You are here
```

---

## ✨ Features

### 👤 User Management
- **Registration** with avatar upload (Cloudinary), email/OTP verification
- **Login/Logout** with JWT access + refresh token flow (httpOnly cookies)
- **Forgot Password** with OTP-based reset via Gmail
- **Profile editing** — bio, location, social links, avatar update
- **Public user profiles** by username

### 🎯 Skill System
- Users can **offer skills** with description, experience level, hourly rate, and portfolio highlights
- Users can list **skills they want to learn**
- Browse all skill offerings on the **Explore** page

### 🤝 Match Requests
- **Swap Request** — free mutual skill exchange
- **Paid Learn Request** — pay-to-learn with agreed price
- Accept / Reject / Cancel request workflow
- View received & sent requests with status tracking

### 💬 Messaging
- Direct messaging between matched users
- Read/unread message tracking

### ⭐ Reviews & Ratings
- Leave reviews (1-5 stars + comment) on skill offerings
- Average ratings auto-calculated per skill and per user

### 🔔 Notifications
- In-app notifications for match requests, payments, reviews
- Mark as read / delete functionality

### 💳 Payments
- UPI-based payment flow for paid learning sessions
- QR code generation for payment links
- Payment status tracking (Requested → UPI Provided → Paid)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (for image uploads)
- **Gmail App Password** (for email verification)

### 1. Clone the Repository
```bash
git clone https://github.com/PrasunTellakula/loop-learn.git
cd loop-learn
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
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `CORS_ORIGIN` | The URL of your deployed frontend (e.g., https://loop-learn-five.vercel.app) |
| `ACCESS_TOKEN_SECRET` | Random 64-char hex string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `REFRESH_TOKEN_SECRET` | Another random 64-char hex string |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_PASS` | Gmail App Password (not your actual password — [generate one here](https://myaccount.google.com/apppasswords)) |

Start the backend:
```bash
npm run dev       # Development (with auto-reload via nodemon)
npm start         # Production
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
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key (if using Clerk auth) |
| `VITE_CURRENCY` | Currency symbol (default: `$`) |
| `VITE_BACKEND_URL` | Backend API URL (default: `http://localhost:8000`) |

Start the frontend:
```bash
npm run dev
```
The app runs on **http://localhost:5173** by default.

---

## 🔌 API Endpoints

### Auth & Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ✗ | Register with avatar upload |
| POST | `/login` | ✗ | Login with email/password |
| POST | `/logout` | ✓ | Logout (clears tokens) |
| POST | `/refresh-token` | ✗ | Refresh access token |
| GET | `/me` | ✓ | Get current user profile |
| PUT | `/update` | ✓ | Update profile details |
| PUT | `/avatar` | ✓ | Update avatar |
| POST | `/change-password` | ✓ | Change password |
| GET | `/profile/:username` | ✗ | Public profile by username |
| GET | `/` | ✗ | Get all users |
| GET | `/verify-email` | ✗ | Verify email via token |
| POST | `/verify-otp` | ✗ | Verify email via OTP |
| POST | `/forgot-password` | ✗ | Request password reset OTP |
| POST | `/reset-password-otp` | ✗ | Reset password with OTP |

### Skills (`/api/skills`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✓ | Create skill offer |
| GET | `/` | ✗ | Get all skill offers |
| GET | `/:id` | ✗ | Get skill offer by ID |
| PUT | `/:id` | ✓ | Update skill offer |
| DELETE | `/:id` | ✓ | Delete skill offer |
| GET | `/user/:userId` | ✗ | Get skills by user |

### Match Requests (`/api/match-requests`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/swap` | ✓ | Send swap request |
| POST | `/paid` | ✓ | Send paid learn request |
| GET | `/received` | ✓ | Get received requests |
| GET | `/sent` | ✓ | Get sent requests |
| PUT | `/:id/status` | ✓ | Accept/reject request |
| DELETE | `/:id` | ✓ | Cancel request |
| GET | `/accepted-swap-partners` | ✓ | Get swap partners |
| GET | `/accepted-learnings` | ✓ | Get learning partners |
| GET | `/accepted-teachings` | ✓ | Get teaching partners |

### Messages (`/api/messages`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✓ | Send message |
| GET | `/:userId` | ✓ | Get chat with user |
| PUT | `/:userId/read` | ✓ | Mark messages as read |

### Reviews (`/api/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✓ | Create review |
| GET | `/:skillOfferId` | ✗ | Get reviews for skill |
| DELETE | `/:id` | ✓ | Delete own review |

### Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | Get all notifications |
| PUT | `/read-all` | ✓ | Mark all as read |
| PUT | `/:id/read` | ✓ | Mark one as read |
| DELETE | `/:id` | ✓ | Delete notification |

### Transactions (`/api/transactions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✓ | Create transaction |
| PUT | `/:id/status` | ✓ | Update status |
| GET | `/` | ✓ | Get user transactions |
| GET | `/:id` | ✓ | Get transaction by ID |
| POST | `/request-payment` | ✓ | Initiate payment request |
| POST | `/submit-upi` | ✓ | Submit UPI ID + QR |
| GET | `/qr/:requestId` | ✓ | Get payment QR code |

---

## 🗄️ Database Models

| Model | Key Fields |
|-------|------------|
| **User** | username, email, fullName, avatar, password, bio, skillsOffered, skillsWanted, location, socialLinks, averageRating, isVerified |
| **SkillOffer** | user, skillName, description, experienceLevel, hourlyRate, highlights |
| **MatchRequest** | sender, receiver, requestedSkill, requestType (Swap/Learn), status, paymentStatus, upiId, qrCode |
| **Message** | sender, receiver, content, type, isRead |
| **Review** | skillOffer, reviewer, rating, comment |
| **Notification** | recipient, type, message, isRead, linkTo |
| **Transaction** | payer, payee, amount, relatedRequest, status |

---

## 🌐 Deployment

### Backend (Render / Railway / Fly.io)
1. Push to GitHub
2. Connect your repo on [Render](https://render.com) or [Railway](https://railway.app)
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables from `.env.example`
6. Set the root directory to `Backend`

### Frontend (Vercel / Netlify)
1. Connect your repo on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Set the root directory to `Frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables from `.env.example`
6. Update `VITE_BACKEND_URL` to your deployed backend URL

> **Important:** Ensure that your `CORS_ORIGIN` in the backend environment matches your deployed frontend URL, and `VITE_BACKEND_URL` in your frontend environment matches your deployed backend URL.

---

## 🛡️ Security Notes

- **Never commit `.env` files** — they are gitignored. Use `.env.example` as a template.
- JWT tokens are stored in **httpOnly cookies** (backend) and **localStorage** (frontend access token).
- Passwords are hashed with **bcrypt** (10 salt rounds).
- File uploads are temporarily stored locally then uploaded to **Cloudinary** (local temp files are deleted on failure).

---

## 📄 License

This project is for educational / portfolio purposes. Feel free to fork and modify.

---

## 👨‍💻 Author

**Prasun Tellakula** — Full-Stack Developer

- 🔗 GitHub: [@PrasunTellakula](https://github.com/PrasunTellakula)
- 🌐 Live Project: [loop-learn-five.vercel.app](https://loop-learn-five.vercel.app/)

Built from scratch as a full-stack portfolio project to demonstrate skills in React, Node.js, Express, MongoDB, JWT authentication, Cloudinary integration, and deployment with Vercel + Render.

---

⭐ **If you found this project helpful, consider giving it a star on GitHub!**
