# Deployment Guide

## Railway Deployment

### 1. Database Setup (PostgreSQL)

1. Create a new PostgreSQL service in Railway
2. Copy the connection string (DATABASE_URL)
3. Add it to your environment variables

### 2. Environment Variables

Set these in Railway:

```bash
# Server
PORT=3000
NODE_ENV=production

# Database (from Railway PostgreSQL)
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# File Storage (AWS S3 or Cloudflare R2)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=...

# OR Cloudflare R2
STORAGE_TYPE=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

### 3. Build & Deploy

Railway will automatically:
1. Detect Node.js project
2. Run `npm install`
3. Run `npm start`

### 4. Run Migrations

After first deployment, run migrations:

```bash
# Via Railway CLI
railway run npm run migrate

# Or via Railway dashboard -> Deployments -> Run Command
npm run migrate
```

### 5. Seed Initial Data

```bash
railway run npm run seed
```

### 6. Health Check

Verify deployment:
```
GET https://your-app.railway.app/health
```

## Cloudflare Frontend Deployment

1. Build frontend:
```bash
cd ..
npm run build
```

2. Deploy to Cloudflare Pages:
   - Connect your repository
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: `VITE_API_URL=https://your-backend.railway.app`

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Seed data loaded (plan limits)
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] CORS configured correctly
- [ ] File storage configured (S3/R2)
- [ ] Frontend API URL configured
- [ ] SSL certificates active
- [ ] Monitoring/logging set up

## Monitoring

- Health check: `/health`
- Logs: Railway dashboard
- Database: Railway PostgreSQL dashboard
- Errors: Check Railway logs

## Backup Strategy

1. Database backups: Railway PostgreSQL has automatic backups
2. Media files: Stored in S3/R2 (durable storage)
3. Regular exports: Use `pg_dump` for manual backups

## Scaling

- Railway automatically scales based on traffic
- Database connection pooling is configured
- Consider Redis for caching if needed
- CDN for media files (Cloudflare R2)

