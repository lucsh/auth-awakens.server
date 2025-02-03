# auth_awakens.server

## Overview

This project is a **multi-tenant REST API** built with **Node.js (Express.js)**, using **PostgreSQL (via knex)**, **Redis**, and **JWT-based authentication**. It supports **user authentication, password resets via email, Google SSO for organizations, and organization-based access control**.

## Features

- **Multi-Tenant Architecture** (Organizations with `tenant_id` per user, enforced by email domain)
- **User Authentication** (Email/Password & JWT-based Auth)
- **Google SSO Support** (Automatic org/user creation by domain)
- **Role-Based Access Control (RBAC)** (SUPERADMIN, ADMIN, USER, READ_ONLY)
- **Password Reset via Email** (Using Nodemailer)
- **Rate Limiting & Security Enhancements** (Helmet.js, Express Rate Limit, CSRF Protection)
- **CSRF Protection** (Implemented using `csurf` and cookies)
- **Database Management** (PostgreSQL with `pg-migrate`)
- **Docker & Docker Compose Support**
- **Health Check API** (`/health`)
- **Unit & Integration Tests** (Jest + Supertest)

### CSRF Protection Details

- CSRF tokens are automatically set in cookies (`XSRF-TOKEN`).
- Requests must include the `X-XSRF-TOKEN` header.
- CSRF protection is enforced on **all state-changing requests** (`POST`, `PUT`, `DELETE`).

### API Documentation

- **Swagger UI** is available at: `http://localhost:3000/api-docs`
- Provides a user-friendly UI for testing API endpoints.

## Tech Stack

- **Node.js** (Express.js)
- **PostgreSQL** (Slonik for SQL safety)
- **Redis** (Session & caching)
- **JWT** (Authentication)
- **Google OAuth2** (Google SSO authentication)
- **Nodemailer** (Email integration)
- **Docker & Docker Compose**
- **Jest & Supertest** (Testing)

## First Start Guide

This guide will help you get up and running quickly, including setting up the database, running migrations, bootstrapping the application, and creating your first `super-admin` user.

### Prerequisites

- **Node.js v23+**
- **PostgreSQL**
- **Redis**
- **Yarn (or npm)**
- **Docker (optional for local setup)**

### Install Dependencies

```sh
yarn install
```

### Environment Variables

Generate a JWT secret with: 

```sh
openssl rand -base64 64
```

Create a `.env` file with:

```env
APP_NAME="Auth Awakens API"
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/mydatabase
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
FRONTEND_URL=https://yourfrontend.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/v1/auth/google/callback
```

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/lucsh/auth-awakens.server
cd auth-awakens.server
```

### 2. Install Dependencies

Install the required Node.js dependencies using `yarn`:

```bash
yarn install
```

## Running the Project

### Option 1: Run Everything in Docker

If you prefer running both the application and database inside Docker, you can simply start Docker Compose:

```bash
docker-compose up --build
```

This will set up the environment and start all the services.

### Option 2: Run Only Databases in Docker

If you want to use **nodemon** for hot-reloading during development, you can follow these steps:

1. **Start Database Services**
   Run only the database services in Docker:

```bash
docker-compose up db redis
```

1. **Run Migrations**
   Use the migration tool (`knex migrate`) to apply the required database migrations:

```bash
   npx knex migrate:latest
```

This ensures your database schema is up to date.

1. **Bootstrap the Application**
   Run the application using **nodemon** for hot-reloading:

```bash
   yarn start:dev
```

## Create the First Super Admin

After the above steps, you'll need to create your first `super-admin` user.

1. **Run Super-Admin Bootstrap Command**
   Use the `bootstrap` script to create the initial `super-admin` user:

```bash
   yarn bootstrap
```

This will generate a default user with `super-admin` privileges. You may be prompted to provide details such as username, email, etc.

1. **Authenticate the Super Admin via cURL**
   To store a session cookie for authenticated API requests, use the following `cURL` command to log in:

```bash
   curl -i -X POST http://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email": "<superadmin_email>", "password": "<superadmin_password>"}' \
     -c cookies.txt
```

Replace `<superadmin_email>` and `<superadmin_password>` with the actual super-admin credentials set during bootstrapping.
This will store the session cookie in the `cookies.txt` file.

## Create Additional Users

Using the stored `super-admin` session cookie, you can now create additional users via the API. For example:

```bash
curl -X POST http://localhost:3000/v1/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name":"user example",
    "email": "user@example.com",
    "password": "user_password",
    "role": "user"
  }'
```

Replace `name`, `email`, `password`, and `role` with the desired values.

## API Endpoints

### Authentication

- `POST /v1/auth/login` → Login with email/password
- `GET /v1/auth/google` → Google OAuth2 login
- `GET /v1/auth/google/callback` → Google OAuth2 callback
- `POST /v1/auth/reset-password` → Request password reset
- `POST /v1/auth/set-password` → Reset password with token

### Users

- `GET /v1/users` → Get all users (Requires Auth & RBAC)
- `POST /v1/users` → Create a new user (RBAC restricted)
- `PUT /v1/users/:id/role` → Update user role (ADMIN & SUPERADMIN only)
- `DELETE /v1/users/:id` → Delete a user (ADMIN only)

### Organizations

- `GET /v1/organizations` → Get all organizations (SUPERADMIN only)
- `POST /v1/organizations` → Create a new organization (SUPERADMIN or domain-restricted)

### Health Check

- `GET /health` → Check if the API is running
- `GET /ping` → Check if the API is running and get a pong

## Testing

### Run tests

```sh
yarn test
```

- Uses **Jest & Supertest** for API testing.
- `.env.test` is loaded automatically for testing.

## Next Steps

- **Extend role-based access control policies**
- **Improve logging & monitoring**
- **Enhance security measures (e.g., OAuth scopes)**
- **Finish the Google SSO configuration**

---
