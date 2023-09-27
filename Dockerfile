# ------------------------------
# Stage 1: Application Building
# ------------------------------

# Import NodeJS image
FROM node:current-alpine

# Create app directory
WORKDIR ./backend/source/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# Install dependencies
COPY package.json ./
COPY package*.json ./
RUN npm install



# ------------------------------
# Stage 2: Application Running
# ------------------------------

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose Port --> Debug
EXPOSE 8080

# Run application
CMD [ "node", "server.js" ]
