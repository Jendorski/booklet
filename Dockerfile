FROM node:24.1.0-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

COPY package.json tsconfig.json .mocharc.json tsoa.json backend/
COPY /src backend/src
WORKDIR /backend
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm swagger
RUN pnpm build

CMD ["sh", "-c", "npm run start"]


ENV TZ=Europe/London
