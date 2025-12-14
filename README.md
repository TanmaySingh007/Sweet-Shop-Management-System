# Sweet Shop Management System

A full-stack application for managing a sweet shop inventory with user authentication, role-based access control, and transactional purchase operations. Built with NestJS (backend) and React (frontend) following Test-Driven Development (TDD) principles.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [My AI Usage](#my-ai-usage)

## Project Overview

The Sweet Shop Management System is a comprehensive inventory management application that allows users to browse and purchase sweets, while administrators can manage the inventory through CRUD operations. The system ensures data integrity through database transactions and implements role-based authorization for administrative functions.

### Key Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: Admin and regular user roles with protected endpoints
- **Sweet Management**: Full CRUD operations for managing sweets inventory
- **Purchase System**: Atomic transaction-based purchase operations preventing overselling
- **Search Functionality**: Flexible search by name, category, and price range
- **Restock Operations**: Admin-only inventory restocking

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js with JWT strategy
- **Validation**: class-validator, class-transformer
- **Testing**: Jest

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: react-router-dom
- **HTTP Client**: Axios
- **State Management**: React Context API

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/TanmaySingh007/Sweet-Shop-Management-System.git
   cd Sweet-Shop-Management-System/sweet-shop-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `sweet-shop-api` directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=sweet_shop_db

   # Application Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=1d
   ```

4. **Create the database**
   ```bash
   createdb sweet_shop_db
   # Or using psql:
   # psql -U postgres
   # CREATE DATABASE sweet_shop_db;
   ```

5. **Run database migrations**
   ```bash
   npm run migration:run
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000/api`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../sweet-shop-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `sweet-shop-frontend` directory:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** User object

#### POST /api/auth/login
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-here"
}
```

### Sweets Endpoints

#### GET /api/sweets
Get all available sweets (public endpoint).

**Response:** Array of sweet objects

#### GET /api/sweets/search
Search sweets with optional filters.

**Query Parameters:**
- `name` (optional): Partial match search
- `category` (optional): Exact match
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price

**Example:** `/api/sweets/search?name=jamun&category=Traditional&minPrice=40&maxPrice=60`

#### GET /api/sweets/:id
Get a specific sweet by ID (public endpoint).

#### POST /api/sweets
Create a new sweet (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Gulab Jamun",
  "category": "Traditional",
  "price": 50.0,
  "quantity": 100
}
```

#### POST /api/sweets/:id/purchase
Purchase a sweet (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Response:** Updated sweet object with decremented quantity

#### POST /api/sweets/:id/restock
Restock a sweet (requires admin authentication).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "quantity": 50
}
```

#### DELETE /api/sweets/:id
Delete a sweet (requires admin authentication).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** 204 No Content

## Testing

### Running Tests

**Unit Tests:**
```bash
npm test
```

**E2E Tests:**
```bash
npm run test:e2e
```

**Test Coverage:**
```bash
npm run test:cov
```

The project maintains high test coverage with comprehensive unit and integration tests following TDD principles.

### Test Coverage Goals

- Minimum 90% line and branch coverage
- Comprehensive exception handling tests
- Transaction concurrency tests
- Authorization and authentication tests

## Database Migrations

**Generate a new migration:**
```bash
npm run migration:generate -- -n MigrationName
```

**Run pending migrations:**
```bash
npm run migration:run
```

**Revert last migration:**
```bash
npm run migration:revert
```

**Show migration status:**
```bash
npm run migration:show
```

## Project Structure

```
sweet-shop-api/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── decorators/    # Custom decorators (@Roles)
│   │   ├── guards/        # Guards (RolesGuard)
│   │   ├── strategies/    # Passport strategies
│   │   └── dto/           # Authentication DTOs
│   ├── sweets/            # Sweets module
│   │   ├── dto/           # Sweet-related DTOs
│   │   └── exceptions/    # Custom exceptions
│   ├── entities/          # TypeORM entities
│   ├── repositories/      # Data access layer
│   └── config/            # Configuration files
├── test/                  # E2E tests
└── src/migrations/        # Database migrations
```

## Screenshots

_Screenshots of the application will be added here._

## My AI Usage

### Tools Used
**Cursor AI**

### How it was Used

The AI assistant (Cursor AI) was extensively used throughout the development process to streamline the Test-Driven Development (TDD) workflow and ensure consistent code quality:

1. **TDD Test Boilerplate Generation (Red Phase)**
   - Generated comprehensive unit test structures for services, controllers, and guards
   - Created E2E test templates for API endpoints
   - Developed test cases covering edge cases, error scenarios, and concurrency situations
   - Ensured test assertions matched business requirements precisely

2. **Service Layer Implementation (Green Phase)**
   - Implemented NestJS service methods following best practices
   - Created database transaction logic using TypeORM QueryRunner
   - Developed repository pattern implementations with TypeORM
   - Built authentication and authorization guards with proper error handling

3. **Database Transaction Implementation**
   - Designed atomic transaction logic for purchase operations
   - Implemented pessimistic locking to prevent race conditions
   - Created proper rollback mechanisms for error scenarios
   - Ensured data integrity through proper transaction management

4. **Git Co-authorship Policy Compliance**
   - Generated commit messages following conventional commit format
   - Added AI co-authorship attribution to all commits
   - Maintained consistent commit message structure throughout the project

5. **Code Structure and Organization**
   - Helped organize modules following NestJS best practices
   - Created proper separation of concerns (controllers, services, repositories)
   - Implemented DTOs with validation decorators
   - Established proper exception handling strategies

### Reflection

The AI assistant systematically streamlined the Red-Green-Refactor cycle, enabling faster iteration and superior adherence to development process rigor. Key benefits included:

- **Accelerated TDD Workflow**: The AI quickly generated comprehensive test suites, allowing me to focus on business logic rather than test boilerplate
- **Consistency**: All code followed consistent patterns and best practices, reducing technical debt
- **Comprehensive Coverage**: The AI helped identify edge cases and scenarios that might have been overlooked, resulting in more robust code
- **Error Handling**: Systematic implementation of proper exception handling and validation ensured production-ready code quality
- **Documentation**: Maintained clear commit messages and code structure that enhances maintainability

The collaborative approach with AI significantly enhanced productivity while maintaining high code quality standards and ensuring full compliance with the TDD methodology and project requirements.

## License

This project is part of a coding kata/assignment and is intended for educational purposes.

## Author

Tanmay Singh

---

For questions or issues, please open an issue on the GitHub repository.
