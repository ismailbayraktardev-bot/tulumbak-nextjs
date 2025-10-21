.PHONY: help install dev build test clean docker-dev docker-prod docker-logs backup restore

# Default target
help:
	@echo "Tulumbak E-commerce Platform - Docker Development Commands"
	@echo ""
	@echo "🔧 Development:"
	@echo "  install         Install all dependencies"
	@echo "  dev             Start development environment"
	@echo "  dev-build       Build development containers"
	@echo "  dev-down        Stop development environment"
	@echo "  dev-logs        Show development logs"
	@echo "  dev-restart     Restart development environment"
	@echo ""
	@echo "🚀 Production:"
	@echo "  prod            Start production environment"
	@echo "  prod-build      Build production containers"
	@echo "  prod-down       Stop production environment"
	@echo "  prod-logs       Show production logs"
	@echo "  prod-restart    Restart production environment"
	@echo ""
	@echo "🧪 Testing & Quality:"
	@echo "  test            Run all tests"
	@echo "  lint            Run linting"
	@echo "  type-check      Run TypeScript checks"
	@echo "  format          Format code"
	@echo ""
	@echo "🗄️ Database:"
	@echo "  db-migrate      Run database migrations"
	@echo "  db-seed         Seed database with sample data"
	@echo "  db-reset        Reset database"
	@echo "  db-backup       Backup database"
	@echo "  db-restore      Restore database"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  logs            Show all logs"
	@echo "  logs-api        Show API logs"
	@echo "  logs-admin      Show admin logs"
	@echo "  logs-store      Show store logs"
	@echo "  health          Check health of all services"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  clean           Clean up Docker resources"
	@echo "  clean-all       Clean up all Docker resources"
	@echo "  update          Update dependencies"
	@echo "  security-scan   Run security scan"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	pnpm install

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-build:
	@echo "🔨 Building development containers..."
	docker-compose -f docker-compose.dev.yml build

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	@echo "📋 Showing development logs..."
	docker-compose -f docker-compose.dev.yml logs -f

dev-restart: dev-down dev

# Production commands
prod:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build

prod-build:
	@echo "🔨 Building production containers..."
	docker-compose -f docker-compose.prod.yml build

prod-down:
	@echo "🛑 Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	@echo "📋 Showing production logs..."
	docker-compose -f docker-compose.prod.yml logs -f

prod-restart: prod-down prod

# Testing and quality
test:
	@echo "🧪 Running tests..."
	pnpm test

lint:
	@echo "🔍 Running linting..."
	pnpm lint

type-check:
	@echo "🔤 Running TypeScript checks..."
	pnpm type-check

format:
	@echo "✨ Formatting code..."
	pnpm format

# Database commands
db-migrate:
	@echo "🗄️ Running database migrations..."
	docker-compose -f docker-compose.dev.yml exec api pnpm migrate

db-seed:
	@echo "🌱 Seeding database..."
	docker-compose -f docker-compose.dev.yml exec api pnpm seed

db-reset:
	@echo "🔄 Resetting database..."
	docker-compose -f docker-compose.dev.yml down postgres
	docker volume rm tulumbak-postgres-data-dev
	docker-compose -f docker-compose.dev.yml up -d postgres

db-backup:
	@echo "💾 Backing up database..."
	mkdir -p backups
	docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U tulumbak_user tulumbak_dev > backups/backup-$(shell date +%Y%m%d-%H%M%S).sql

db-restore:
	@echo "🔄 Restoring database..."
	@if [ -z "$(FILE)" ]; then echo "Usage: make db-restore FILE=backup.sql"; exit 1; fi
	docker-compose -f docker-compose.dev.yml exec -T postgres psql -U tulumbak_user tulumbak_dev < $(FILE)

# Monitoring commands
logs:
	@echo "📋 Showing all logs..."
	docker-compose -f docker-compose.dev.yml logs -f

logs-api:
	@echo "📋 Showing API logs..."
	docker-compose -f docker-compose.dev.yml logs -f api

logs-admin:
	@echo "📋 Showing admin logs..."
	docker-compose -f docker-compose.dev.yml logs -f admin-dashboard

logs-store:
	@echo "📋 Showing store logs..."
	docker-compose -f docker-compose.dev.yml logs -f store

health:
	@echo "❤️ Checking health of all services..."
	@echo "API: $$(curl -s http://localhost:3000/api/health | jq -r '.status // "error"')"
	@echo "Admin: $$(curl -s http://localhost:3001/admin/health | jq -r '.status // "error"')"
	@echo "Store: $$(curl -s http://localhost:3002/store/health | jq -r '.status // "error"')"
	@echo "Nginx: $$(curl -s http://localhost/health | head -1)"

# Maintenance commands
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

clean-all:
	@echo "🧹 Cleaning up all Docker resources..."
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	docker-compose -f docker-compose.prod.yml down -v --rmi all
	docker system prune -a -f
	docker volume prune -f

update:
	@echo "⬆️ Updating dependencies..."
	pnpm update
	docker-compose -f docker-compose.dev.yml pull

security-scan:
	@echo "🔒 Running security scan..."
	docker run --rm -v "$(PWD):/app" -w /app aquasec/trivy:latest fs --format table --exit-code 1 .

# Development utilities
shell-api:
	@echo "🐚 Opening API shell..."
	docker-compose -f docker-compose.dev.yml exec api sh

shell-admin:
	@echo "🐚 Opening admin shell..."
	docker-compose -f docker-compose.dev.yml exec admin-dashboard sh

shell-store:
	@echo "🐚 Opening store shell..."
	docker-compose -f docker-compose.dev.yml exec store sh

shell-db:
	@echo "🐚 Opening database shell..."
	docker-compose -f docker-compose.dev.yml exec postgres psql -U tulumbak_user tulumbak_dev

# Quick start commands
quick-start: install dev-build
	@echo "🚀 Quick start complete! Environment is building..."

quick-stop: dev-down
	@echo "🛑 Quick stop complete!"

# Production deployment
deploy-staging:
	@echo "🚀 Deploying to staging..."
	git checkout staging
	git pull origin staging
	make prod-build
	make prod-down
	make prod

deploy-production:
	@echo "🚀 Deploying to production..."
	git checkout main
	git pull origin main
	make prod-build
	make prod-down
	make prod

# Backup and restore
backup:
	@echo "💾 Creating full backup..."
	mkdir -p backups/$(shell date +%Y%m%d)
	docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U tulumbak_user tulumbak_prod > backups/$(shell date +%Y%m%d)/database-$(shell date +%H%M%S).sql
	tar -czf backups/$(shell date +%Y%m%d)/config-$(shell date +%H%M%S).tar.gz .env.* docker-compose.* nginx.conf

restore:
	@echo "🔄 Restoring from backup..."
	@if [ -z "$(FILE)" ]; then echo "Usage: make restore FILE=backup.tar.gz"; exit 1; fi
	tar -xzf $(FILE)
	make prod-down
	make prod

# Development shortcuts
d: dev
dl: dev-logs
dr: dev-restart
p: prod
pl: prod-logs
pr: prod-restart
t: test
l: lint
f: format
c: clean