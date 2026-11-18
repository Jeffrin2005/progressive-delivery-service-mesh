
FROM node:24-alpine

ENV NODE_ENV=production

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY backend/src ./src
COPY frontend/dist /app/frontend/dist

RUN mkdir -p /tmp/shared-files && \
    chown -R node:node /tmp/shared-files

USER node

EXPOSE 8080

CMD ["node", "src/server.js"]
