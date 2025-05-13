# Task Management Dashboard

This project is a full-stack task management application built with the MERN stack (MongoDB, Express, React, Node.js). It enables users to create, manage, and track tasks within groups, featuring task searching, group filtering, pagination, real-time updates via Socket.io, and task statistics visualization using Chart.js.

## Project Structure

### Client (`frontend/`)

- `src/api/test.ts`: API client for tasks, groups, and statistics
- `src/components/tasks/`: Task-related components (e.g., `TaskList.tsx`, `TaskForm.tsx`, `SearchFilterSort.tsx`)
- `src/components/groups/GroupSelector.tsx`: Group selection dropdown
- `src/pages/Home.tsx`: Main dashboard page
- `src/services/socket.ts`: Socket.io client for real-time updates
- `src/types/`: TypeScript interfaces (e.g., `task.types.ts`, `group.types.ts`)

### Server (`backend/`)

- `src/controllers/`: API controllers (e.g., tasks, groups, statistics)
- `src/models/`: Mongoose schemas (e.g., `Task.ts`, `Group.ts`)
- `src/routes/`: API routes (e.g., `tasks.ts`, `groups.ts`)
- `src/services/`: Business logic (e.g., `taskService.ts`)
- `src/socket.ts`: Socket.io server setup
- `src/index.ts`: Express server setup

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **MongoDB**: v5 or higher (local or MongoDB Atlas)
- **Git**: For cloning the repository

## Backend Setup

1. Navigate to the `backend/` directory and install dependencies:

   ```bash
   cd backend
   npm install
   npm run dev
   
## Frontend Setup   

1. Navigate to the `frontend/` directory and install dependencies:

   ```bash
   cd frontend
   npm install
   npm run dev

## Hosted Url 
 https://task-management-two-theta.vercel.app/