FROM node:16.13.1-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install --ignore-scripts --no-audit --no-fund
COPY src ./src
RUN npm run build
FROM node:16.13.1-alpine
ENV NODE_ENV=production PORT=4605
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node openapi.json ./openapi.json
USER node
EXPOSE 4605
CMD ["node","dist/server.js"]
