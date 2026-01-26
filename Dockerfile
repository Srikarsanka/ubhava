# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy package files first (cache optimization)
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy application source code
COPY . .

# Expose the API port (Render will override with $PORT)
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
