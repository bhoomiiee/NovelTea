FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Create uploads dir and give ownership to node user BEFORE switching user
RUN mkdir -p uploads && chown -R node:node /app

EXPOSE 5000

USER node

CMD ["node", "index.js"]
