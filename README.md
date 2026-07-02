# SaaS Todo List (Monorepo)

A premium, full-stack SaaS Todo List application built with a **NestJS** backend and a **React + Vite** frontend. Features include **Google Firestore** for document persistence, **Google Cloud Storage (GCS)** for task attachment uploads, and a robust **Offline Mock Fallback Mode** for seamless local development without configuring cloud services.

---

## 📂 Monorepo Structure

```
todo-saas/
│
├── backend/               # NestJS API Application
│   ├── src/               # Application logic (auth, firebase, todo-lists, todos)
│   ├── package.json       # Backend package configuration
│   └── tsconfig.json      # TypeScript compiler configuration
│
├── frontend/              # React + Vite Client Application
│   ├── src/               # React components, pages, custom hooks, and context
│   ├── package.json       # Frontend package configuration
│   └── tailwind.config.js # Tailwind CSS design tokens
│
├── docs/                  # Project documentation
│   └── project_analysis.md # Structural, architectural, and logical flow report
│
├── .gitignore             # Global gitignore configuration
└── README.md              # Main project documentation (this file)
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: `v18.x` or higher
- **NPM**: `v9.x` or higher

---

### 1. Run Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (Optional):
   Copy `.env.example` to `.env` and fill in Firebase credentials if you wish to run in live mode:
   ```bash
   cp .env.example .env
   ```
   > 💡 **Note:** If no `.env` file is present, or if it contains dummy configurations, the backend will automatically initialize in **Offline Mock Mode** using in-memory local maps.

4. Start the server:
   ```bash
   # Development / watch mode
   npm run start:dev
   
   # Or standard execution
   npm start
   ```

5. Explore API Swagger documentation at [http://localhost:5000/api/docs](http://localhost:5000/api/docs).

---

### 2. Run Frontend Client

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧠 Core System Documentation

An in-depth guide to the project's technical architecture, component interactions, database mapping, and data flow is available in the [docs/project_analysis.md](file:///d:/personal/todo-saas/docs/project_analysis.md) file. 

Key topics documented in the analysis:
- **Hybrid Offline/Online Database Persistence Pattern**
- **User Authentication & Permission Guarding**
- **Cascading Deletions for Lists and GCS Attachments**
- **Query-Driven State Updates via React Query**
- **Interactive Sequence Diagrams**
