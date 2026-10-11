FROM node:20-alpine

WORKDIR /app

# Copy dependency definition
COPY src/package.json ./

# Install production dependencies (including multer & prom-client)
RUN npm install --only=production

# Copy all source code including config, controllers, routes, views
COPY src/ ./

# Expose microservice HTTP port
EXPOSE 8080

# Run as non-root user for security best practices
USER node

CMD ["node", "server.js"]
