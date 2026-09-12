# Stage 1: build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: backend serving the API + the built frontend
FROM node:20-alpine
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
ENV DATA_DIR=/data
ENV PUBLIC_DIR=/app/public
VOLUME ["/data"]

EXPOSE 3001
CMD ["node", "src/index.js"]
