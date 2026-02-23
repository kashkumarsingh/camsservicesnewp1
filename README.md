# CAMS Service - Monorepo

A monorepo containing the frontend (Next.js) and backend (Laravel API) applications, built with Clean Architecture principles.

## 🏗️ Monorepo Structure

```
cams-service/
├── frontend/          # Next.js 16 application
├── backend/           # Laravel 12.x API
├── docker-compose.yml # Docker configuration
└── docs/             # Project documentation
```

## 🚀 Getting Started

### Frontend (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Backend (Laravel API)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Start development server
php artisan serve

# Admin dashboard is the Next.js app at http://localhost:4300/dashboard/admin
```

**Or use Docker:**

```bash
# Start all services
docker compose up -d

# Run migrations
docker compose exec backend php artisan migrate

# Seed database
docker compose exec backend php artisan db:seed

# Access services
# Frontend: http://localhost:4300 (mapped from container port 3000)
# Backend API: http://localhost:9080/api/v1
# Admin dashboard: http://localhost:4300/dashboard/admin (Next.js; log in with an admin account)
```

### Real-time updates (Reverb / WebSocket)

For live notification bell and dashboard updates without refreshing the page:

1. **Backend** – Ensure `backend/.env` has Reverb settings (copy from `backend/.env.example` if needed):
   - `BROADCAST_CONNECTION=reverb`
   - `REVERB_APP_KEY=local-dev-key`
   - `REVERB_APP_SECRET=local-dev-secret`
   - `REVERB_HOST=0.0.0.0`
   - `REVERB_PORT=8080`

2. **Start Reverb** (from project root):
   ```bash
   ./scripts/start-reverb.sh
   ```
   Or from backend: `cd backend && php artisan reverb:start`. Reverb listens on port **8080**.

3. **Frontend** – Ensure `frontend/.env.local` has (see `frontend/env.template` or `frontend/env.reverb.example`):
   - `NEXT_PUBLIC_LIVE_REFRESH_WEBSOCKET_ENABLED=true`
   - `NEXT_PUBLIC_REVERB_APP_KEY=local-dev-key`
   - `NEXT_PUBLIC_REVERB_WS_HOST=localhost`
   - `NEXT_PUBLIC_REVERB_WS_PORT=8080`
   - `NEXT_PUBLIC_REVERB_SCHEME=http`

4. Restart the Next.js dev server after changing env vars. With backend API, Reverb, and frontend all running, the dashboard will receive real-time updates.

**Docker:** If you use `docker compose`, the `reverb` service runs Reverb for you; ensure `backend/.env` has the same Reverb vars and the frontend uses `NEXT_PUBLIC_REVERB_WS_HOST=localhost` (port 8080 is published).

## 🏗️ Architecture

This project follows **Clean Architecture** principles:

### Frontend Structure
```
frontend/src/
├── core/
│   ├── domain/          # Domain entities, value objects, services
│   └── application/     # Use cases, DTOs, mappers, factories
├── infrastructure/      # Repositories, external services, HTTP client
├── interfaces/
│   └── web/            # React hooks, components
└── components/         # UI primitives, layout, shared components
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.1
- **Language**: TypeScript 5.9.3
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.x
- **Architecture**: Clean Architecture / Domain-Driven Design

### Backend
- **Framework**: Laravel 12.x LTS
- **Language**: PHP 8.3+
- **API**: RESTful API with Sanctum authentication
- **CMS**: Filament 4.x (Laravel-native admin panel)
- **Database**: MySQL 8.0+

## 📦 Project Structure

### Frontend
- `frontend/src/core/domain/` - Business logic and domain entities
- `frontend/src/core/application/` - Use cases and application services
- `frontend/src/infrastructure/` - External services and data access
- `frontend/src/interfaces/web/` - React components and hooks
- `frontend/src/components/` - Reusable UI components

## 🔧 Development

### Frontend Commands
```bash
cd frontend

# Type checking
npm run lint

# Development server with Turbopack
npm run dev

# Production build
npm run build
```

## 📚 Documentation

### Quick Start
- **[Machine-Independent Setup Guide](docs/cleanarchitecture/developer-guide/MACHINE_INDEPENDENT_SETUP.md)** ⭐ **START HERE** - Complete setup for new developers
- **[Local Native Setup Guide](docs/cleanarchitecture/developer-guide/LOCAL_NATIVE_SETUP.md)** ⭐ **NO DOCKER** - Setup without Docker/WSL (native PHP/Node.js)
- **[WSL + Docker Local Setup Guide](docs/cleanarchitecture/developer-guide/WSL_DOCKER_LOCAL_SETUP.md)** ⭐ **WSL USERS** - Step-by-step WSL setup with Docker
- **[Developer Guide](docs/cleanarchitecture/developer-guide/README.md)** - All developer documentation

### Architecture & Guides
- [Clean Architecture Documentation](docs/cleanarchitecture/) - Architecture guides and structure documentation
- [Frontend Documentation](docs/cleanarchitecture/frontend/) - Frontend setup and guides
- [Backend Documentation](docs/cleanarchitecture/backend/) - Backend setup and guides
- [Docker Setup Guide](docs/cleanarchitecture/docker/) - Complete Docker setup instructions
- [Cloud Deployment Guide](docs/cleanarchitecture/deployment/) - Deploy to Render.com, Railway.app, etc.

### Deployment Guides
- **[Render.com Deployment Guide](docs/deployment/RENDER_DEPLOYMENT_GUIDE.md)** ⭐ **RENDER** - Step-by-step Render.com deployment
- **[Google Cloud Deployment Guide](docs/deployment/GOOGLE_CLOUD_DEPLOYMENT_GUIDE.md)** ⭐ **GCP** - Step-by-step Google Cloud deployment
- [Stripe Webhook Setup](docs/deployment/RENDER_STRIPE_WEBHOOK_SETUP.md) - Stripe webhook configuration

### Scripts & Utilities
- **[Setup Script](scripts/README.md)** - `scripts/setup.sh` for machine-independent setup
- **[Validation Script](scripts/README.md)** - `scripts/validate.sh` for environment validation
- **[Test Scripts](scripts/)** - Testing utilities including `test-booking-flow.ps1`

**Note**: Detailed `.md` files in `docs/cleanarchitecture/` are for internal reference only.

## 🚀 Deployment

### Render.com (Recommended - Free Tier)

1. Connect your GitHub repository to Render.com
2. Use the `render.yaml` Blueprint for automatic setup
3. Render will create:
   - Web Service (backend) with Docker
   - MySQL Database
   - All environment variables

See [Cloud Deployment Guide](docs/cleanarchitecture/guide/CLOUD_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Railway.app

1. Connect your GitHub repository
2. Set Root Directory to `backend`
3. Add MySQL database
4. Configure environment variables

See [Cloud Deployment Guide](docs/cleanarchitecture/guide/CLOUD_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📝 License

Private project - All rights reserved
