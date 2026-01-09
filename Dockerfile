# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (cache optimization)
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
