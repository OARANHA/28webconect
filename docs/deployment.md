# Deployment Guide

Instructions for deploying the 28Web Connect platform.

## Table of Contents

- [Vercel Deployment](#vercel-deployment)
- [VPS Deployment (Contabo)](#vps-deployment-contabo)
- [Database Migrations](#database-migrations)
- [Environment Configuration](#environment-configuration)
- [Monitoring](#monitoring)
- [Backup Strategy](#backup-strategy)
- [Rollback Procedure](#rollback-procedure)

---

## Vercel Deployment

### Prerequisites

- Vercel account
- GitHub repository connected
- PostgreSQL database (Vercel Postgres or external)

### Steps

1. **Connect Repository**

   ```bash
   # Using Vercel CLI
   npm i -g vercel
   vercel
   ```

2. **Configure Environment Variables**

   In Vercel Dashboard → Project Settings → Environment Variables:

   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://your-domain.com
   MISTRAL_API_KEY=...
   MAILGUN_API_KEY=...
   ```

3. **Configure Cron Jobs**

   Create `vercel.json`:

   ```json
   {
     "crons": [
       {
         "path": "/api/cron/data-retention",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```

4. **Deploy**

   Automatic on push to main branch, or manual:

   ```bash
   vercel --prod
   ```

5. **Custom Domain**

   Vercel Dashboard → Domains → Add Domain

### Pros/Cons

| Pros               | Cons                     |
| ------------------ | ------------------------ |
| Easy deployment    | Higher cost at scale     |
| Automatic SSL      | Cold starts              |
| Global CDN         | File storage limitations |
| Serverless scaling |                          |

---

## VPS Deployment (Contabo)

### Server Requirements

- Ubuntu 22.04 LTS
- 4GB RAM minimum
- 2 CPU cores
- 50GB SSD storage

### Installation Steps

1. **Update System**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js 18+**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **Install PostgreSQL 14+**

   ```bash
   sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
   wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc
   sudo apt update
   sudo apt install -y postgresql-14 postgresql-contrib

   # Enable pgvector
   sudo apt install -y postgresql-14-pgvector
   ```

4. **Install Nginx**

   ```bash
   sudo apt install -y nginx
   ```

5. **Clone Repository**

   ```bash
   cd /var/www
   sudo git clone https://github.com/your-org/28web-connect.git
   cd 28web-connect
   sudo npm install
   ```

6. **Configure Environment**

   ```bash
   sudo cp .env.example .env.production
   sudo nano .env.production
   # Configure all production values
   ```

7. **Setup Database**

   ```bash
   sudo -u postgres psql -c "CREATE DATABASE webconnect;"
   sudo -u postgres psql -c "CREATE USER webuser WITH PASSWORD 'strongpassword';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE webconnect TO webuser;"
   sudo -u postgres psql -d webconnect -c "CREATE EXTENSION IF NOT EXISTS vector;"

   # Run migrations
   npx prisma migrate deploy
   ```

8. **Build Application**

   ```bash
   npm run build
   ```

9. **Setup PM2**

   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "28web" -- start
   pm2 startup
   pm2 save
   ```

10. **Configure Nginx**

    ```bash
    sudo nano /etc/nginx/sites-available/28web
    ```

    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

    ```bash
    sudo ln -s /etc/nginx/sites-available/28web /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

11. **Setup SSL with Let's Encrypt**

    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

12. **Configure Cron Jobs**

    ```bash
    crontab -e
    ```

    ```
    # Data retention - daily at 2 AM
    0 2 * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/data-retention

    # Database backup - daily at 3 AM
    0 3 * * * /var/www/28web-connect/scripts/backup-db.sh
    ```

---

## Database Migrations

### Production Migration

```bash
# Always backup first
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma db pull
```

### Rollback Migration

```bash
# If needed, revert to previous version
git checkout <previous-commit>
npm install
npm run build
pm2 restart 28web
```

---

## Environment Configuration

### Development vs Production

| Variable       | Development             | Production            |
| -------------- | ----------------------- | --------------------- |
| `NODE_ENV`     | `development`           | `production`          |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://domain.com`  |
| `DATABASE_URL` | Local PostgreSQL        | Production PostgreSQL |
| `LOG_LEVEL`    | `debug`                 | `warn`                |

### Security Checklist

- [ ] Strong database password
- [ ] NEXTAUTH_SECRET generated (`openssl rand -base64 32`)
- [ ] CRON_SECRET configured
- [ ] HTTPS enforced
- [ ] Environment variables in secure storage

---

## Monitoring

### Recommended Tools

| Tool        | Purpose           | Cost        |
| ----------- | ----------------- | ----------- |
| Sentry      | Error tracking    | Freemium    |
| UptimeRobot | Uptime monitoring | Free tier   |
| Umami       | Analytics         | Self-hosted |
| New Relic   | APM               | Freemium    |

### Setup Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Health Check Endpoint

```bash
# Add to your deployment
curl https://your-domain.com/api/health
```

---

## Backup Strategy

### Database Backups

```bash
# Daily automated backup (add to crontab)
#!/bin/bash
# scripts/backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > /backups/db-$DATE.sql.gz
find /backups -name "db-*.sql.gz" -mtime +7 -delete
```

### File Backups

```bash
# Uploads backup
#!/bin/bash
# scripts/backup-files.sh
tar -czf /backups/uploads-$(date +%Y%m%d).tar.gz uploads/
find /backups -name "uploads-*.tar.gz" -mtime +30 -delete
```

### Off-site Backup

```bash
# Sync to S3 or similar
aws s3 sync /backups s3://your-backup-bucket/28web/
```

---

## Rollback Procedure

### Quick Rollback

```bash
# Using PM2
pm2 stop 28web
git checkout <previous-tag>
npm install
npm run build
pm2 start 28web
```

### Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup-20240101.sql
```

### Verification

```bash
# Check application health
curl -f https://your-domain.com/api/health || echo "ROLLBACK FAILED"

# Check error logs
pm2 logs 28web --lines 50
```

---

## Troubleshooting

### Common Issues

**Build fails:**

```bash
# Clear cache
rm -rf .next
npm run build
```

**Database connection:**

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Port already in use:**

```bash
# Find and kill process
sudo lsof -i :3000
sudo kill -9 <PID>
```

---

## Support

For deployment issues:

- Email: devops@28webconnect.com
- Documentation: https://docs.28webconnect.com
