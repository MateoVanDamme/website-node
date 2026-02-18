FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base AS development
RUN npm install
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm install --production
COPY . .
CMD ["npm", "start"]
