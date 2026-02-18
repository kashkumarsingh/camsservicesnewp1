# Development Environments – Docker vs Local

We use **Option B (local frontend)** for day-to-day development. Two options:

- **Option B:** Backend in Docker, frontend on your machine → faster HMR, easier debugging.
- **Option A:** Everything in Docker → use when testing production-like setup.

---

## Option B: Local development (default – commands to run yourself)

Run these from the **project root** (`camsservicep1/`), then start the frontend in a separate terminal.

### 1. Stop any full stack (if running)

```bash
docker compose down
```

### 2. Start backend services only (no frontend container)

```bash
docker compose up -d backend db redis
```

Optional (e.g. for email testing / DB UI):

```bash
docker compose up -d backend db redis mailhog phpmyadmin
```

### 3. Ensure frontend env

Create or edit `frontend/.env.local` so the app talks to the backend on the host:

```env
NEXT_PUBLIC_API_URL=http://localhost:9080/api/v1
```

### 4. Run the frontend locally (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

### 5. Open the app

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:9080](http://localhost:9080) (e.g. `/api/v1/...`)

### When you are done

Stop backend services:

```bash
docker compose down
```

Stop the frontend in the terminal where `npm run dev` is running: **Ctrl+C**.

---

## Option A: Docker environment (production-like)

- **Where:** `docker compose up` from project root.
- **Frontend:** Containerised; port mapping **4300:3000** (host:container).
- **Access:** [http://localhost:4300](http://localhost:4300)
- **Use when:** Testing full production-like setup, CI, or deployment behaviour.

Ensure `frontend/.env.local` (if used) points at the backend in Docker, e.g.:

```env
NEXT_PUBLIC_API_URL=http://localhost:9080/api/v1
```

---

## Summary

| Approach              | Frontend runs on        | URL                     | Best for              |
|-----------------------|-------------------------|-------------------------|-----------------------|
| Option B (default)    | Host (`npm run dev`)    | http://localhost:3000   | Day-to-day development |
| Option A              | Container               | http://localhost:4300   | Full stack / production-like |
