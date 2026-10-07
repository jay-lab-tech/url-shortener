FROM node:24-bookworm

WORKDIR /app
COPY api/package.json api/package-lock.json ./
RUN npm ci
COPY api/prisma ./prisma
COPY api/prisma7.config.ts api/tsconfig.json ./
COPY docs ./docs
COPY api/src ./src
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/url_shortener npm run db:generate \
    && npm run build

ENV NODE_ENV=production
EXPOSE 3002
CMD ["sh", "-c", "npm run db:deploy && npm start"]
