# Digital Signage Backend API

Multi-tenant digital signage system backend API built with Node.js, Express, and PostgreSQL.

## Features

- Multi-tenant architecture with plan-based limits
- JWT authentication with refresh tokens
- RESTful API endpoints
- Real-time updates via WebSocket
- File storage integration (S3/R2)
- Plan management (Free, Basic, Premium, Kurumsal)
- Usage tracking and limit enforcement

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Run database migrations:
```bash
npm run migrate
```

5. Seed initial data (plans, default tenant):
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

## API Documentation

API endpoints are documented in the plan file. Base URL: `http://localhost:3000/api`

## Database

PostgreSQL database with migrations in `src/database/migrations/`

## Plan Limits

- **Free**: 1 display, 1 user, 1GB storage
- **Basic**: 5 displays, 3 users, 10GB storage
- **Premium**: 25 displays, 10 users, 100GB storage
- **Kurumsal**: Unlimited displays, unlimited users, unlimited storage

