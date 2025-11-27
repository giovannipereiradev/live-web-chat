FROM node:18

# Define working directory inside container
WORKDIR /usr/src/app

# Copy package files first (for faster rebuilds)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything (including /public)
COPY . .

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
