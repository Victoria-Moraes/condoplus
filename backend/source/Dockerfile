# ------------------------------
# Stage 1: Application Building
# ------------------------------

# Import NodeJS image
FROM node:current-alpine

# Create app directory
WORKDIR /backend/source/app

# Install dependencies
COPY package.json ./
RUN npm install

# Bundle app source
COPY . .


# ------------------------------
# Stage 2: Application Running
# ------------------------------

# If you are building your code for production
# RUN npm ci --only=production

# Expose Port --> Debug
EXPOSE 8080

# Run application
CMD [ "node", "app.js" ]
