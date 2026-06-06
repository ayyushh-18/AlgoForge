# Contributing to AlgoForge

Thank you for your interest in contributing to AlgoForge! This guide will help you understand the project structure, set up your local development environment, configure the required environment variables, follow our branching conventions, and prepare your pull requests.

---

## Project Structure

AlgoForge is organized as a monorepo split into a React frontend (`app/`) and an Express backend (`backend/`). Below is a map of the key directories and files:

```
AlgoForge/
├── app/                              # Frontend React application
│   ├── src/
│   │   ├── api/                      # API integration layer and fetch utilities
│   │   ├── components/               # Shared visual UI components
│   │   ├── contexts/                 # Global state providers (Auth, Theme, etc.)
│   │   ├── hooks/                    # Reusable React hooks
│   │   ├── sections/                 # Pages and section layouts (Dashboard, Roadmaps, etc.)
│   │   ├── lib/                      # Utilities and configuration
│   │   ├── App.tsx                   # Main router and page manager
│   │   └── main.tsx                  # React DOM mount point and third-party wrappers
│   ├── .env                          # Local frontend environment variables
│   └── package.json                  # Frontend dependencies and scripts
│
├── backend/                          # Backend Express API server
│   ├── src/
│   │   ├── config/                   # Configuration files (Prisma DB clients, etc.)
│   │   ├── controllers/              # Route handlers / controllers
│   │   ├── middleware/               # Auth guard, error validation, etc.
│   │   ├── routes/                   # Router definitions
│   │   ├── scripts/                  # Seed and migration utilities
│   │   └── server.ts                 # Express app initialization
│   ├── prisma/
│   │   └── schema.prisma             # Prisma database schema definition
│   ├── .env                          # Local backend environment variables
│   └── package.json                  # Backend dependencies and scripts
│
└── README.md                         # Main repository summary and high-level setup
```

---

## Local Setup

Follow these steps to set up the project locally:

### Prerequisites
- **Node.js**: Version 18 or higher.
- **MongoDB**: A running MongoDB database (either a local instance or MongoDB Atlas connection).

### 1. Clone the Repository
Clone the repository and enter the directory:
```bash
git clone https://github.com/Rishabhworkspace/AlgoForge-2.0.git
cd AlgoForge-2.0
```

### 2. Configure the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory. You can base it on the environment variables guide below.
4. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
5. Seed the database with initial learning paths, topics, and problems:
   ```bash
   npm run seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000` by default.

### 3. Configure the Frontend
1. Open a new terminal, navigate to the frontend directory:
   ```bash
   cd ../app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `app/` directory.
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## Environment Variables

### Backend Environment Variables (`backend/.env`)

These variables must be configured in your `backend/.env` file:

| Variable Name | Description | Example / Default Value |
| :--- | :--- | :--- |
| `PORT` | The port number on which the backend Express server will run. | `5000` |
| `MONGO_URI` | MongoDB connection URI, including the database name. Prisma uses this connection string. | `mongodb://127.0.0.1:27017/algoforge` |
| `JWT_SECRET` | Secret key used for signing and verifying JSON Web Tokens (JWT) for authentication. | `your_jwt_secret_key` |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID for validating Google sign-in credentials. | `your_google_client_id.apps.googleusercontent.com` |
| `CLIENT_URL` | The URL of the frontend application. Used for CORS settings and OAuth redirections. | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini API key used to power the AlgoBot AI assistant. | `AIzaSyYourGeminiAPIKeyHere` |

### Frontend Environment Variables (`app/.env`)

These variables must be configured in your `app/.env` file:

| Variable Name | Description | Example / Default Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | The URL endpoint of the Express backend API. | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google Client ID for frontend Google Login provider initialization. | `your_google_client_id.apps.googleusercontent.com` |

---

## Branching Strategy

To keep the repository history clean and organized, we follow a simple branching naming convention. Prefix your branch names according to the nature of your change:

- **Features**: `feature/<short-description>` (e.g., `feature/leaderboard-filters`)
- **Bug Fixes**: `bugfix/<short-description>` (e.g., `bugfix/streak-reset`)
- **Hot Fixes**: `hotfix/<short-description>` (e.g., `hotfix/login-crash`)
- **Documentation**: `docs/<short-description>` (e.g., `docs/contributing-guide`)
- **Refactoring**: `refactor/<short-description>` (e.g., `refactor/api-hooks`)

---

## PR Checklist

Before you submit a Pull Request, please make sure you go through this checklist:

- [ ] **Tests Pass**: Run the application locally and verify that everything starts without errors.
- [ ] **Lint and Format**: Ensure your code is clean and properly formatted.
- [ ] **Self-Review**: Look over your changes to make sure there is no leftover debug code or temporary files.
- [ ] **Environment Variables**: If your change introduces new environment variables, verify they are documented in this guide.
- [ ] **PR Description**: Write a clear, concise summary of the changes, the problems solved, and how to verify/test the changes.
