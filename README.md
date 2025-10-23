# Booklet 🏠

[![Pull Request Workflow](https://github.com/Jendorski/booklet/actions/workflows/pr.yml/badge.svg)](https://github.com/Jendorski/booklet/actions/workflows/pr.yml)
[![Deploy to Cloud Run](https://github.com/Jendorski/booklet/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jendorski/booklet/actions/workflows/deploy.yml)[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)

A modern short-term apartment rental booking platform built with Node.js, TypeScript, and Express.

## 🚀 Features

-   **User Management**: Registration, authentication with JWT
-   **Apartment Listings**: CRUD operations for apartment management
-   **Booking System**: Create and manage apartment bookings
-   **Rate Limiting**: Built-in API rate limiting for security
-   **Caching**: Redis-powered caching for optimal performance
-   **Queue Processing**: Background job processing with BullMQ
-   **API Documentation**: Interactive Swagger/OpenAPI documentation
-   **Security**: Comprehensive security headers and CORS configuration

## 🛠 Tech Stack

-   **Runtime**: Node.js >= 20.0.0
-   **Language**: TypeScript
-   **Framework**: Express.js
-   **Database**: PostgreSQL with Sequelize ORM
-   **Cache**: Redis
-   **Queue**: BullMQ
-   **Authentication**: JWT
-   **Documentation**: TSOA (TypeScript OpenAPI)
-   **Monitoring**: Grafana + Loki + Alloy
-   **Testing**: Mocha + Supertest
-   **Container**: Docker & Docker Compose

## 🚀 Getting Started

### Prerequisites

-   Node.js >= 20.0.0
-   npm >= 10.0.0 (or pnpm recommended)
-   Docker & Docker Compose
-   PostgreSQL (if running locally without Docker)
-   Redis (if running locally without Docker)

### Local Development Setup

1. **Clone the repository**

    ```bash
    git clone https://github.com/Jendorski/booklet.git
    cd booklet
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    # or
    npm install
    ```

3. **Environment setup**

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4. **Start services with Docker**

    ```bash
    # Start all services (backend, redis, monitoring)
    docker compose up -d

    # For development with hot reload
    docker compose -f docker-compose-dev.yml up
    ```

5. **Run database migrations**

    ```bash
    pnpm migrate
    ```

6. **Access the application**
    - API: https://cloud-run-source-deploy-264795560183.europe-west1.run.app
    - Swagger Documentation: https://cloud-run-source-deploy-264795560183.europe-west1.run.app/docs
    - Queue Dashboard: https://cloud-run-source-deploy-264795560183.europe-west1.run.app/letts/qb

### Manual Setup (without Docker)

1. **Start PostgreSQL and Redis services**

2. **Build the application**

    ```bash
    pnpm build
    ```

3. **Start the server**

    ```bash
    pnpm start
    ```

4. **Development mode with hot reload**
    ```bash
    pnpm build:test:watch
    ```

## 🧪 Testing

The project uses Mocha as the testing framework with Supertest for API testing.

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode for development
pnpm build:test:watch
```

### Test Structure

-   **Integration Tests**: API endpoint testing with `.ispec.ts` files
-   **Service Tests**: Business logic testing with `.ispec.ts` files
-   **Test Database**: Separate test environment with Docker

### Writing Tests

Tests follow the pattern:

-   Controllers: `*.controller.ispec.ts` (integration tests)
-   Services: `*.service.ispec.ts` (integration tests)

## 📋 Available Scripts

```bash
pnpm build          # Build TypeScript to JavaScript
pnpm start          # Start production server
pnpm migrate        # Run database migrations
pnpm swagger        # Generate Swagger/OpenAPI specs
pnpm lint           # Run ESLint
pnpm tsc            # Type check without emitting
```

## 🔧 API Documentation

Interactive API documentation is available at `/docs` when the server is running:

-   **Swagger UI**: https://cloud-run-source-deploy-264795560183.europe-west1.run.app/docs
-   **Health Check**: https://cloud-run-source-deploy-264795560183.europe-west1.run.app/api/v1/health

## 🏗 Project Structure

```
src/
├── modules/           # Feature modules
│   ├── apartment/     # Apartment management
│   ├── booking/       # Booking system
│   └── user/         # User management
├── shared/           # Shared utilities
│   ├── config/       # Configuration
│   ├── middlewares/  # Express middlewares
│   ├── jwt/          # JWT utilities
│   └── logger/       # Logging setup
├── database/         # Database setup
│   ├── models/       # Sequelize models
│   └── migrations/   # Database migrations
└── cache/           # Redis caching
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feat/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the CC0-1.0 License - see the [LICENSE](LICENSE) file for details.
