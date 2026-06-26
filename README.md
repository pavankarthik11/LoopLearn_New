# LoopLearn 🚀

LoopLearn is a comprehensive e-learning platform built with a robust backend for managing courses, users, and progress, alongside a sleek and modern frontend interface.

## 🌟 Features

- **User Authentication**: Secure login and registration powered by Clerk.
- **Course Management**: Seamlessly create, view, and manage educational courses.
- **Rich Content Editing**: Integrated Quill editor for flexible content creation.
- **Video Integration**: Embed educational videos using React YouTube.
- **Media Uploads**: Cloudinary integration for robust image and media handling.
- **Progress Tracking**: Monitor user learning progress with visual indicators.
- **Responsive Design**: Beautiful and fully responsive UI powered by Tailwind CSS.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Authentication**: Clerk React
- **Routing**: React Router DOM
- **Libraries**: Quill (Rich Text), React YouTube, TS Particles

### Backend (Server)
- **Runtime & Framework**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Cloud Storage**: Cloudinary
- **Security**: JWT, Bcrypt
- **Email Services**: Nodemailer, Resend
- **Utilities**: Multer, Node-cron, QRCode

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- API Keys for Cloudinary and Clerk

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LoopLearn
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   # Copy .env.example to .env and fill in your variables (Database URI, Cloudinary keys, JWT secret, etc.)
   cp .env.example .env
   # Start the development server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../Frontend
   npm install
   # Copy .env.example to .env and fill in your variables (Clerk keys, API URL)
   cp .env.example .env
   # Start the Vite development server
   npm run dev
   ```

## 📜 Available Scripts

### Backend (`/Backend`)
- `npm run dev`: Starts the backend server in development mode using nodemon.
- `npm start`: Starts the backend server in production mode.

### Frontend (`/Frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Runs ESLint for code quality checks.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to open a pull request or create an issue to improve the project.
