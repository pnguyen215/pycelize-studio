# =============================================================================
# pycelize-studio Makefile
# =============================================================================
# This Makefile provides convenient commands for setting up, running,
# testing, linting, and managing the pycelize-studio Next.js application.
#
# Usage:
#   make help          - Show available commands
#   make install       - Install dependencies
#   make dev           - Run development server
#   make build         - Build production bundle
#   make start         - Start production server
#   make lint          - Run linting
#   make test          - Run tests (if configured)
#   make clean         - Clean generated files
#   make docker-build  - Build Docker image
#   make docker-run    - Run Docker container
# =============================================================================

.PHONY: help install dev build start lint test clean \
        docker-build docker-run docker-stop docker-logs \
        docker-shell docker-restart docker-clean docker-prune \
        fresh

# =============================================================================
# Configuration
# =============================================================================

# Node / package manager
NODE ?= node
PNPM ?= pnpm
NPM ?= npm
YARN ?= yarn

# Default package manager (change if you prefer npm/yarn)
PKG ?= pnpm

# Docker configuration
DOCKER_IMAGE    = pycelize-studio
DOCKER_TAG      = latest
DOCKER_CONTAINER= pycelize-studio-app
DOCKER_PORT     = 3000

# Next.js
NEXT_PORT       = 3000

# Colors for terminal output
CYAN   = \033[0;36m
GREEN  = \033[0;32m
YELLOW = \033[0;33m
RED    = \033[0;31m
NC     = \033[0m

# =============================================================================
# Helpers
# =============================================================================

define print_section
	@echo ""
	@echo "$(CYAN)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║  $(1)$(NC)"
	@echo "$(CYAN)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
endef

# =============================================================================
# Help
# =============================================================================

help:
	@echo ""
	@echo "$(CYAN)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║           pycelize-studio - Available Commands               ║$(NC)"
	@echo "$(CYAN)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Installation:$(NC)"
	@echo "  make install      - Install dependencies using $(PKG)"
	@echo "  make fresh        - Clean node_modules and reinstall"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev          - Run Next.js dev server on port $(NEXT_PORT)"
	@echo "  make build        - Build production bundle"
	@echo "  make start        - Start Next.js in production mode"
	@echo ""
	@echo "$(GREEN)Quality:$(NC)"
	@echo "  make lint         - Run linter (next lint / eslint)"
	@echo "  make test         - Run tests (if configured, e.g. vitest/jest)"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean        - Remove .next, dist, coverage, and cache folders"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-build - Build Docker image $(DOCKER_IMAGE):$(DOCKER_TAG)"
	@echo "  make docker-run   - Run Docker container on port $(DOCKER_PORT)"
	@echo "  make docker-stop  - Stop running container"
	@echo "  make docker-logs  - View container logs"
	@echo "  make docker-shell - Open shell inside container"
	@echo "  make docker-clean - Remove stopped containers and dangling images"
	@echo "  make docker-prune - Prune all unused Docker data"
	@echo ""

# =============================================================================
# Package Manager Abstraction
# =============================================================================

install:
	$(call print_section,"Installing dependencies with $(PKG)")
	@if [ "$(PKG)" = "pnpm" ]; then \
		$(PNPM) install; \
	elif [ "$(PKG)" = "yarn" ]; then \
		$(YARN) install; \
	else \
		$(NPM) install; \
	fi

dev:
	$(call print_section,"Starting Next.js dev server")
	@if [ "$(PKG)" = "pnpm" ]; then \
		$(PNPM) dev; \
	elif [ "$(PKG)" = "yarn" ]; then \
		$(YARN) dev; \
	else \
		$(NPM) run dev; \
	fi

run: dev

build:
	$(call print_section,"Building Next.js app for production")
	@if [ "$(PKG)" = "pnpm" ]; then \
		$(PNPM) build; \
	elif [ "$(PKG)" = "yarn" ]; then \
		$(YARN) build; \
	else \
		$(NPM) run build; \
	fi

start:
	$(call print_section,"Starting Next.js in production mode")
	@if [ "$(PKG)" = "pnpm" ]; then \
		$(PNPM) start; \
	elif [ "$(PKG)" = "yarn" ]; then \
		$(YARN) start; \
	else \
		$(NPM) run start; \
	fi

lint:
	$(call print_section,"Running linter")
	@if [ "$(PKG)" = "pnpm" ]; then \
		$(PNPM) lint || true; \
	elif [ "$(PKG)" = "yarn" ]; then \
		$(YARN) lint || true; \
	else \
		$(NPM) run lint || true; \
	fi

test:
	$(call print_section,"Running tests")
	@if [ -f "vitest.config.ts" ] || [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then \
		if [ "$(PKG)" = "pnpm" ]; then \
			$(PNPM) test; \
		elif [ "$(PKG)" = "yarn" ]; then \
			$(YARN) test; \
		else \
			$(NPM) test; \
		fi \
	else \
		echo "$(YELLOW)No test configuration found. Skipping tests.$(NC)"; \
	fi

# =============================================================================
# Maintenance
# =============================================================================

clean:
	$(call print_section,"Cleaning generated files")
	rm -rf .next dist coverage node_modules/.cache
	@echo "$(GREEN)Clean complete.$(NC)"

fresh: clean
	$(call print_section,"Reinstalling dependencies")
	rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock
	$(MAKE) install

# =============================================================================
# Docker
# =============================================================================

docker-build:
	$(call print_section,"Building Docker image $(DOCKER_IMAGE):$(DOCKER_TAG)")
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-run:
	$(call print_section,"Running Docker container $(DOCKER_CONTAINER)")
	docker run -d \
		--name $(DOCKER_CONTAINER) \
		-p $(DOCKER_PORT):3000 \
		$(DOCKER_IMAGE):$(DOCKER_TAG)

docker-stop:
	$(call print_section,"Stopping Docker container $(DOCKER_CONTAINER)")
	- docker stop $(DOCKER_CONTAINER) || true
	- docker rm $(DOCKER_CONTAINER) || true

docker-logs:
	$(call print_section,"Logs for container $(DOCKER_CONTAINER)")
	docker logs -f $(DOCKER_CONTAINER)

docker-shell:
	$(call print_section,"Opening shell in container $(DOCKER_CONTAINER)")
	docker exec -it $(DOCKER_CONTAINER) sh

docker-restart: docker-stop docker-run

docker-clean:
	$(call print_section,"Cleaning stopped containers and dangling images")
	- docker container prune -f
	- docker image prune -f

docker-prune:
	$(call print_section,"Pruning all unused Docker data")
	docker system prune -a