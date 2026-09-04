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

# Apply the committed migrations, seed once, then run the dev server with hot
# reload. Same mechanism as production so local and prod cannot drift apart;
# to change the schema, edit schema.prisma and run `npm run db:migrate`.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm run dev"]
