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
# IMPORTANT: Always run docker compose from the monorepo root (where docker-compose.yml lives).
# If you see "Could not open input file: artisan" or ls /var/www/html shows only "storage",
# the backend volume mount is wrong — run from project root and recreate:
#   cd /path/to/camsservicesnewp1
#   docker compose down && docker compose up -d

# Start all services
docker compose up -d

# Run migrations (use full path to artisan; container CWD can differ when using exec)
docker compose exec backend php /var/www/html/artisan migrate

# Seed database
docker compose exec backend php /var/www/html/artisan db:seed

# Access services
# Frontend: http://localhost:4300 (mapped from container port 3000)
# Backend API: http://localhost:9080/api/v1
# Admin dashboard: http://localhost:4300/dashboard/admin (Next.js; log in with an admin account)
```

**Storage / log permission errors (500s, Stripe/broadcasting failing):** The backend entrypoint fixes `storage` and `bootstrap/cache` permissions on startup so PHP-FPM (www-data) can write. If you still see "Permission denied" on `storage/logs/laravel.log`, on the host run: `chmod -R 775 backend/storage backend/bootstrap/cache` (or `chown -R 82:82 backend/storage backend/bootstrap/cache` to match the container’s www-data UID).

### Test login credentials (local / development only)

The repo does **not** seed default users. These are the only test accounts referenced in the codebase:

| Role   | Email                         | Password   | Dashboard          |
|--------|-------------------------------|------------|--------------------|
| **Admin**  | `admin@camsservices.co.uk`   | `password` | `/dashboard/admin`  |
| **Trainer**| `gemma.stone001@example.com`  | `password` | `/dashboard/trainer`|
| **Parent** | *(none by default)*           | —          | `/dashboard/parent` |

- **Admin:** Created when you run `php artisan test:approval-workflow` (see `backend/app/Console/Commands/TestApprovalWorkflow.php`). Or create in Tinker: `User::create(['name'=>'Admin','email'=>'admin@camsservices.co.uk','password'=>bcrypt('password'),'role'=>'admin','email_verified_at'=>now()]);`
- **Trainer:** User must exist first (e.g. via “Become a trainer” + admin approval). Then set password: from repo root run `docker compose exec backend php /var/www/html/set_trainer_password.php` (sets `gemma.stone001@example.com` to `password`).
- **Parent:** Register on the frontend or create via Admin → Users. To set a known password: `php artisan user:reset-password parent@example.com password`.

**Reset any user’s password:** `php artisan user:reset-password {email} {password}` (from `backend/`).

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

**Broadcasting auth 403 (POST /api/v1/broadcasting/auth):** If the frontend gets 403 when subscribing to private channels, (1) ensure you’re logged in and the Bearer token is sent (see `LiveRefreshContext` auth headers), (2) clear backend caches so channel rules in `routes/channels.php` are loaded: from project root run `./scripts/clear-cache-backend-docker.sh`, or manually: `docker compose exec backend php /var/www/html/artisan config:clear && docker compose exec backend php /var/www/html/artisan route:clear && docker compose exec backend php /var/www/html/artisan optimize:clear`. Then restart the backend if needed: `docker compose restart backend`.

### Stripe webhooks (local and deployed)

Bookings only update after payment when Stripe sends the webhook and your backend processes it. The **signing secret** is tied to the **endpoint URL** — use the right one per environment.

**Localhost (Stripe cannot call localhost):**

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli#install) and run `stripe login` once.
2. In a terminal, run (leave it running):
   ```bash
   stripe listen --forward-to http://localhost:9080/api/v1/webhooks/stripe
   ```
3. Copy the printed `whsec_...` secret into `backend/.env` as `STRIPE_WEBHOOK_SECRET`.
4. Restart the backend, then trigger a test payment. Events appear in the CLI and the booking should update.

**Railway (deployed backend):**

1. In [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks), click **Add endpoint**.
2. **Endpoint URL:** `https://YOUR-RAILWAY-DOMAIN/api/v1/webhooks/stripe` (your real Railway API host).
3. Subscribe to **Payment intent succeeded** (`payment_intent.succeeded`), then add the endpoint.
4. Reveal the **Signing secret** for that endpoint and set it in Railway as `STRIPE_WEBHOOK_SECRET` (Variables / env).
5. Redeploy if needed. After that, paying on the deployed app should update the booking.

Do not use the Dashboard secret for localhost or the CLI secret for production.

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
- **Admin**: Next.js dashboard at `/dashboard/admin` (API-only backend; no Filament)
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
