# Dockerfile
FROM node:18-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Run prisma generate
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Start the application
CMD ["pnpm", "start:dev"]