# Use the official Node.js image (using Alpine for a smaller footprint)
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (using npm install for standard package installation)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the Node.js application
CMD ["npm", "start"]
