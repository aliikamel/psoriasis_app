# Use an official Node runtime as a parent image
FROM node:16-alpine

# Set working directory
WORKDIR /app/frontend

# Install dependencies
COPY package*.json /app/frontend/
RUN npm install

# Add rest of the client app
COPY . /app/frontend

# Expose port 3000 to access server
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
