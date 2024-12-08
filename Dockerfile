# Use the official Bun image
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# Install dependencies for development
FROM base AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Install production dependencies
FROM base AS prod_deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Prepare the application
FROM base AS prerelease
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .

# Optional: Test and build
# Uncomment the following lines if you want to test/build
# ENV NODE_ENV=production
# RUN bun test
# RUN bun run build

# Final production image
FROM base AS release
WORKDIR /usr/src/app
COPY --from=prod_deps /usr/src/app/node_modules ./node_modules
COPY . .

# Set Bun as the user and start the app
# USER bun
EXPOSE 3000/tcp
CMD ["bun", "start"]
