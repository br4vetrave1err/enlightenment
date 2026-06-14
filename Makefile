SHELL := /bin/bash
.PHONY: up down logs logs-db logs-web rebuild test test-unit test-contract test-integration clean help shell db-shell

# Default target
help:
	@echo "Roadmap Learning - Project Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make up          Start dev containers (FastAPI + MongoDB) & Vite frontend"
	@echo "  make down        Stop containers & Vite frontend"
	@echo "  make logs        Follow FastAPI logs"
	@echo "  make logs-db     Follow MongoDB logs"
	@echo "  make logs-web    Follow Vite frontend logs"
	@echo "  make rebuild     Rebuild and restart containers"
	@echo "  make test        Run all tests (unit + contract + integration)"
	@echo "  make test-unit   Run unit tests only"
	@echo "  make test-contract Run contract tests only"
	@echo "  make test-integration Run integration tests (requires Docker running)"
	@echo "  make shell       Open shell in FastAPI container"
	@echo "  make db-shell    Open mongosh in MongoDB container"
	@echo "  make clean       Stop containers, remove volumes & stop Vite"

COMPOSE := docker compose -f docker/docker-compose.yml --env-file .env

up:
	$(COMPOSE) up -d
	@if ! pgrep -f "[n]ode_modules/\.bin/vite" > /dev/null; then \
		echo "Starting Vite frontend..."; \
		cd web && setsid npm run dev > vite.log 2>&1 & \
	else \
		echo "Vite frontend is already running."; \
	fi

down:
	$(COMPOSE) down
	@if pgrep -f "[n]ode_modules/\.bin/vite" > /dev/null; then \
		echo "Stopping Vite frontend..."; \
		pkill -f "node_modules/\.bin/vite" || true; \
	fi

logs:
	$(COMPOSE) logs -f fastapi

logs-db:
	$(COMPOSE) logs -f mongodb

logs-web:
	tail -f web/vite.log

rebuild:
	$(COMPOSE) down
	$(COMPOSE) up -d --build

test: test-unit test-contract test-integration

test-unit:
	cd backend && .venv/bin/python -m pytest tests/unit/ -v

test-contract:
	cd backend && .venv/bin/python -m pytest tests/contract/ -v

test-integration:
	cd backend && .venv/bin/python -m pytest tests/integration/ -v

shell:
	docker exec -it docker-fastapi-1 /bin/bash

db-shell:
	docker exec -it docker-mongodb-1 mongosh roadmap_learning

clean:
	$(COMPOSE) down -v
	@if pgrep -f "[n]ode_modules/\.bin/vite" > /dev/null; then \
		echo "Stopping Vite frontend..."; \
		pkill -f "node_modules/\.bin/vite" || true; \
	fi
