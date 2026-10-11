FROM node:20-alpine

WORKDIR /app

# Copy backend dependencies
COPY backend/package.json ./backend/

# Install production dependencies
RUN cd backend && npm install --only=production

# Copy backend source code & frontend dist build
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set working directory to backend
WORKDIR /app/backend

EXPOSE 8080

USER node

CMD ["node", "src/server.js"]
