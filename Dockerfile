# Use official Node.js LTS image
FROM node:18-alpine

# Install Lua 5.1 (required by Prometheus)
RUN apk add --no-cache lua5.1

# Clone the original Prometheus repository
RUN git clone https://github.com/prometheus-lua/Prometheus.git /prometheus

# Set working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
