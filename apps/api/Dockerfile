FROM node:26-slim
WORKDIR /app

# 1) Önce sadece package dosyaları → bağımlılık katmanı önbellekte kalır

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspace=@my-menu/api

# 2) Sonra kaynak kod

COPY apps/api apps/api
WORKDIR /app/apps/api

# generate veritabanına bağlanmaz; config yüklensin diye SAHTE bir adres yeter

RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate

ENV NODE_ENV=production
CMD ["node", "src/server.js"]
