# Produção: API Express + ficheiros Vite em /dist
#
# Build (defina o Client ID OAuth usado no bundle):
#   docker build --build-arg VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com -t cadastro-ci .
#
# Run (secrets só em runtime):
#   docker run -p 3000:3000 \
#     -e GOOGLE_CLIENT_ID=... \
#     -e GOOGLE_CLIENT_SECRET=... \
#     -e SESSION_SECRET=$(openssl rand -hex 32) \
#     -v cij-data:/data \
#     -e SQLITE_DB_PATH=/data/cij.db \
#     cadastro-ci
#
# Redirect URI no Google Cloud: http://localhost:3000/api/oauth/google/callback (ou o teu domínio:3000)

FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

ENV NODE_ENV=production
ENV SERVE_STATIC=1

EXPOSE 3000

CMD ["npm", "start"]
