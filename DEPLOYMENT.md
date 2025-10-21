# Tulumbak E-Ticaret Platformu - Deployment Guide

## Overview
Bu guide, Tulumbak e-ticaret platformunun production ortamına nasıl deploy edileceğini açıklar.

## Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PM2 (for production)
- Cloud provider (AWS, Vercel, Railway, etc.)

## Environment Variables

### Store App (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.tulumbak.com
NEXT_PUBLIC_SITE_URL=https://tulumbak.com

# Authentication
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=https://tulumbak.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis (for caching)
REDIS_URL=redis://user:password@host:port

# Payment Providers
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx

# File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=tulumbak-uploads
```

### API App (.env.local)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-jwt-secret

# Email Service
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@tulumbak.com

# Payment
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Build Process

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Build Packages
```bash
# Build shared packages
pnpm --filter @tulumbak/ui build
pnpm --filter @tulumbak/shared build
pnpm --filter @tulumbak/config build

# Build applications
pnpm --filter @tulumbak/store build
pnpm --filter @tulumbak/api build
```

### 3. Run Production Build
```bash
# Store app
cd apps/store
pnpm build
pnpm start

# API app
cd apps/api
pnpm build
pnpm start
```

## Deployment Options

### Option 1: Vercel (Recommended for Store App)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/store
vercel --prod
```

### Option 2: Railway (Full Stack)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

### Option 3: Docker + PM2 (Self-hosted)
```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Or use PM2
cd apps/store
pnpm build
pm2 start ecosystem.config.js --env production
```

## Docker Configuration

### Production Dockerfile
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY . .
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Production Docker Compose
```yaml
version: '3.8'
services:
  store:
    build:
      context: ./apps/store
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.prod
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: tulumbak
      POSTGRES_USER: tulumbak
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Performance Optimization

### 1. Image Optimization
- WebP/AVIF format support enabled
- Responsive image sizes configured
- Lazy loading implemented

### 2. Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- Bundle analysis with `@next/bundle-analyzer`

### 3. Caching Strategy
- Redis for session and API caching
- CDN for static assets
- Next.js ISR for semi-static content

### 4. Monitoring
- Sentry for error tracking
- Vercel Analytics for performance
- Custom metrics dashboard

## Security Checklist

### 1. Environment Security
- [ ] All secrets in environment variables
- [ ] .env files in .gitignore
- [ ] Production secrets different from dev

### 2. API Security
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protection

### 3. Authentication
- [ ] Secure session management
- [ ] Password hashing with bcrypt
- [ ] JWT token expiration
- [ ] OAuth provider security

### 4. Data Protection
- [ ] HTTPS enforced in production
- [ ] Database encryption at rest
- [ ] Regular backups configured
- [ ] GDPR compliance

## Monitoring & Logging

### 1. Application Monitoring
```bash
# Health checks
curl https://api.tulumbak.com/health
curl https://tulumbak.com/api/health

# Logs
pm2 logs
docker-compose logs -f
```

### 2. Performance Monitoring
- Core Web Vitals tracking
- Error rate monitoring
- Response time alerts
- Database performance metrics

## Rollback Strategy

### 1. Git-based Rollback
```bash
# Rollback to previous commit
git revert HEAD
git push origin main
# Redeploy
```

### 2. Blue-Green Deployment
- Maintain two production environments
- Switch traffic between versions
- Zero-downtime deployments

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

#### Database Connection Issues
```bash
# Check connection
psql $DATABASE_URL
# Verify migrations
pnpm prisma migrate status
```

#### Memory Issues
```bash
# Check Node.js memory usage
node --max-old-space-size=4096
# Monitor with PM2
pm2 monit
```

## Support

For deployment issues:
1. Check logs: `pm2 logs` or `docker-compose logs`
2. Review this documentation
3. Check GitHub Issues
4. Contact devops team

## Post-Deployment Checklist

- [ ] All health checks passing
- [ ] Database migrations completed
- [ ] CDN cache cleared
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured
- [ ] Backup verification completed
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] User acceptance testing completed