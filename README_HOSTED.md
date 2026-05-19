# Advanced ADAS Scheduler — Hosted Web App Setup

This version is ready for a hosted web app with mobile technician access.

Recommended production stack:

- Frontend: Vercel
- Backend/API: Render or Railway
- Database: Supabase PostgreSQL
- Photo storage: Supabase Storage
- URL: `jobs.advancedadas.com.au`

## 1. Create Supabase project

1. Go to Supabase and create a new project.
2. Copy the project `DATABASE_URL` connection string.
3. Open Supabase SQL Editor and run:
   - `database/schema.sql`
   - `database/supabase-storage.sql`

## 2. Deploy backend API

Deploy the `server` folder to Render or Railway.

Set these environment variables:

```bash
NODE_ENV=production
DATABASE_URL=your-supabase-postgres-connection-string
JWT_SECRET=use-a-long-random-secret-minimum-32-characters
JWT_EXPIRES_IN=12h
CLIENT_URL=https://your-vercel-domain.vercel.app
STORAGE_DRIVER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=job-photos
```

After deploy, run the seed command once from the backend shell:

```bash
npm run seed
```

Then change the default passwords immediately.

## 3. Deploy frontend

Deploy the `client` folder to Vercel.

Set:

```bash
VITE_API_URL=https://your-backend-url/api
```

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

## 4. Point your domain

Recommended subdomain:

```text
jobs.advancedadas.com.au
```

Point the DNS CNAME to Vercel, then update backend `CLIENT_URL` to the final domain.

## 5. Mobile technician use

Technicians open the same website on their phone browser. They can:

- view only their assigned jobs
- open daily/weekly/monthly calendar
- mark jobs completed
- upload photos from phone camera

Employees cannot retrieve other employees' jobs because the backend filters every employee job query by their authenticated user ID.

## Default seeded users

| Role | Email | Password |
|---|---|---|
| Admin | admin@advancedadas.com.au | Admin123! |
| Employee | brett@advancedadas.com.au | Employee123! |
| Employee | tech@advancedadas.com.au | Employee123! |

Change these before real use.
