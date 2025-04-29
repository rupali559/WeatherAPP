# backend/Dockerfile

# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy rest of the backend code
COPY . .

# Expose backend server port
EXPOSE 5000

# Command to run your backend server
CMD ["node", "server.js"]
