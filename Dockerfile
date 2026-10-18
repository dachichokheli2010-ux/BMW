FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY public ./public
COPY server ./server
COPY drizzle ./drizzle
COPY scripts/preview-local.mjs ./scripts/preview-local.mjs
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DATABASE_PATH=/data/bmw-garage.sqlite
VOLUME ["/data"]
EXPOSE 3000
CMD ["node", "scripts/preview-local.mjs"]
