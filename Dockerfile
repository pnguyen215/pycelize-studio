# =============================================================================
# pycelize-studio Dockerfile
# =============================================================================
# Production-ready Next.js image for the pycelize-studio web UI.
# - Multi-stage build (builder + runtime)
# - Uses pnpm (can be switched to npm/yarn if needed)
# =============================================================================

# ----------------------------
# 1) Builder stage
# ----------------------------
    FROM node:20-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Install dependencies for building
    RUN apk add --no-cache libc6-compat
    
    # Copy package manager files (adjust according to your project)
    # If you use npm: copy package.json package-lock.json
    # If you use yarn: copy package.json yarn.lock
    # If you use pnpm: copy package.json pnpm-lock.yaml
    COPY package.json pnpm-lock.yaml* ./
    
    # Install pnpm globally (remove if you prefer npm/yarn)
    RUN npm install -g pnpm
    
    # Install dependencies (no dev pruning here, Next build needs dev deps)
    RUN pnpm install
    
    # Copy the rest of the source code
    COPY . .
    
    # Build Next.js app
    RUN pnpm build
    
    # ----------------------------
    # 2) Runner stage
    # ----------------------------
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Enable Next.js standalone output if configured
    # (if you use experimental output: 'standalone', you can adjust copy paths)
    # For generic build, copy needed directories:
    COPY --from=builder /app/package.json ./
    COPY --from=builder /app/pnpm-lock.yaml* ./
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.* ./ 
    COPY --from=builder /app/node_modules ./node_modules
    
    # If you need other config files (tsconfig, env example, etc.), copy as needed:
    # COPY --from=builder /app/tsconfig.json ./tsconfig.json
    
    # Expose Next.js port
    EXPOSE 3000
    
    # Default command to start the app
    CMD ["pnpm", "start"]