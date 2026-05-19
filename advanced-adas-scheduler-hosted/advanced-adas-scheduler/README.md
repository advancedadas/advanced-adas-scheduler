# Advanced ADAS Job Scheduler

Production-ready ADAS calibration job scheduling app for Advanced ADAS Calibrations.

## Stack

- React + Vite frontend
- FullCalendar calendar interface
- Node.js + Express backend
- PostgreSQL + Sequelize ORM
- JWT authentication with role-based server-side isolation
- Multer local photo uploads

## Local setup

### 1. Create PostgreSQL database

```bash
createdb advanced_adas_scheduler
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` if needed.

### 3. Install dependencies

```bash
npm run install:all
```

### 4. Seed users and sample jobs

```bash
npm run seed
```

Seeded accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@advancedadas.com.au | Admin123! |
| Employee | brett@advancedadas.com.au | Employee123! |
| Employee | tech@advancedadas.com.au | Employee123! |

### 5. Run locally

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

## Deployment notes

### Backend

Deploy the `server` folder to Render, Railway, Fly.io, AWS ECS, or a VPS.

Set environment variables:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=use-a-long-random-secret
CLIENT_URL=https://your-frontend-domain.com
UPLOAD_DIR=uploads
```

Run:

```bash
npm install
npm start
```

For production, store uploads in S3 or equivalent object storage rather than local disk if using ephemeral hosting.

### Frontend

Deploy the `client` folder to Vercel, Netlify, Cloudflare Pages, or static hosting.

Set:

```bash
VITE_API_URL=https://your-backend-domain.com/api
```

Build:

```bash
npm install
npm run build
```

## Security model

- JWT contains user id and role.
- Every protected API route verifies JWT server-side.
- Admin routes require `role === admin`.
- Employee job queries are always constrained with `assignedToId = req.user.id`.
- Employee updates are only permitted against their own assigned jobs.
- Photo upload endpoint verifies the job belongs to the employee or admin before accepting files.
- Employees cannot request another employee's jobs by direct API calls.

## Useful endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/jobs`
- `POST /api/jobs` admin only
- `PUT /api/jobs/:id`
- `PATCH /api/jobs/:id/complete`
- `DELETE /api/jobs/:id` admin only
- `POST /api/jobs/:id/photos`
- `GET /api/admin/overview` admin only
- `GET /api/users/employees` admin only


## Hosted web app setup

Use `README_HOSTED.md` for Vercel + Render/Railway + Supabase deployment with mobile technician access.
