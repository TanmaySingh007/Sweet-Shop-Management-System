# Sweet Shop Management System

A full-stack application for managing a sweet shop inventory with user authentication, role-based access control, and transactional purchase operations.

## Repository Structure

```
Sweet-Shop-Management-System/
├── sweet-shop-api/        # Backend (NestJS)
└── sweet-shop-frontend/   # Frontend (React + Vite)
```

## Quick Start

### Backend Setup

```bash
cd sweet-shop-api
npm install
# Configure .env file (see sweet-shop-api/README.md)
npm run migration:run
npm run start:dev
```

### Frontend Setup

```bash
cd sweet-shop-frontend
npm install
# Configure .env file with VITE_API_URL
npm run dev
```

## Detailed Documentation

See [sweet-shop-api/README.md](./sweet-shop-api/README.md) for complete setup instructions, API documentation, and project details.

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, JWT Authentication
- **Frontend**: React, TypeScript, Vite, React Router, Axios

## Features

- User authentication and authorization
- Role-based access control (Admin/User)
- Sweet inventory management (CRUD)
- Atomic purchase transactions
- Search and filter functionality
- Admin restock operations

