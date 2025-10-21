# 🐳 Docker Development Guide

## 🚀 Docker Port Configuration

### Local Development Ports
| Service | Port | URL | Status |
|---------|------|-----|--------|
| Backend API | 3005 | http://localhost:3005 | ✅ Active |
| Admin Dashboard | 3002 | http://localhost:3002 | ✅ Ready |
| Store Frontend | 3003 | http://localhost:3003 | ✅ Ready |
| PostgreSQL | 5432 | localhost:5432 | ✅ Ready |
| Redis | 6379 | localhost:6379 | ✅ Ready |

### Docker Network Configuration
- **Network Name:** tulumbak-network
- **Network Type:** bridge
- **All services isolated within network**
- **External access through mapped ports**

## 🛠️ Docker Commands

### Start All Services
```bash
docker-compose up -d
```

### Start Specific Service
```bash
docker-compose up -d postgres
docker-compose up -d api
docker-compose up -d admin-dashboard
docker-compose up -d store
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### View Logs
```bash
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Rebuild Services
```bash
docker-compose build api
docker-compose build --no-cache
```

### Access Containers
```bash
docker-compose exec api sh
docker-compose exec postgres psql -U postgres -d tulumbak
docker-compose exec redis redis-cli
```

## 🔧 Environment Variables

### Production Environment
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/tulumbak`
- `REDIS_URL=redis://redis:6379`
- `PORT=3005`

### API Configuration
- JWT secrets for authentication
- PayTR credentials for payments
- Database connection strings
- Redis cache configuration

## 📊 Health Checks

### PostgreSQL
```bash
docker-compose exec postgres pg_isready -U postgres
```

### Redis
```bash
docker-compose exec redis redis-cli ping
```

### API
```bash
curl http://localhost:3005/api/test
```

## 🔒 Security Considerations

- **Internal Network:** Services communicate internally through Docker network
- **External Access:** Only necessary ports exposed to host
- **Environment Variables:** Sensitive data stored in Docker environment
- **Database Isolation:** PostgreSQL accessible only within network
- **Redis Isolation:** Redis accessible only within network

## 🚨 Troubleshooting

### Port Conflicts
If ports are already in use:
```bash
# Check what's using ports
netstat -ano | findstr :3005
netstat -ano | findstr :5432

# Kill processes using ports
taskkill /PID <process_id> /F
```

### Database Connection Issues
```bash
# Reset database volume
docker-compose down -v
docker-compose up -d postgres
```

### API Build Issues
```bash
# Rebuild without cache
docker-compose build --no-cache api
docker-compose up -d api
```

### Log Issues
```bash
# View detailed logs
docker-compose logs --tail=50 api
docker-compose logs --tail=50 postgres
```

## 🔄 Migration Between Local and Docker

### From Local Development to Docker
1. Stop local services: `pnpm ports:kill`
2. Start Docker services: `docker-compose up -d`
3. Update API URL in frontend apps to `http://localhost:3005`
4. Test all endpoints

### From Docker to Local Development
1. Stop Docker services: `docker-compose down`
2. Start local services: `pnm ports:start`
3. Update API URL in frontend apps to `http://localhost:3001` (if needed)
4. Test all endpoints

## 🚀 Quick Start

```bash
# 1. Start all services
docker-compose up -d

# 2. Check service status
docker-compose ps

# 3. Test API
curl http://localhost:3005/api/test

# 4. Access applications
# Store: http://localhost:3003
# Admin: http://localhost:3002
# API: http://localhost:3005
```

## 📱 Development Workflow

### 1. Development
```bash
# Start development environment
docker-compose up -d

# Watch logs for API
docker-compose logs -f api

# Make code changes
# API will rebuild automatically (with nodemon)
```

### 2. Testing
```bash
# Test API endpoints
curl http://localhost:3005/api/products
curl http://localhost:3005/api/categories
curl http://localhost:3005/api/test

# Test authentication
curl -X POST http://localhost:3005/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Production Build
```bash
# Build production images
docker-compose build --no-cache

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Notes

- All services are isolated within Docker network
- Database persists in Docker volume `postgres_data`
- Redis persists in Docker volume `redis_data`
- API automatically rebuilds on code changes in development
- Frontend apps require manual rebuild for changes
- Use `docker-compose down -v` to reset all data