FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json ./
RUN npm install

# Prisma schema + source
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate

EXPOSE 3001

# Push schema, seed once, then run the dev server with hot reload.
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && npm run seed && npm run dev"]
