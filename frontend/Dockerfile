FROM node:20-alpine

WORKDIR /app

# We are setting development ENV first, can be production too
ENV NODE_ENV=development

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Run next build (if you wanted production)
# RUN npm run build
# For simplicity in local dev we will just use next dev. To use prod, change CMD to `npm start` 
# after uncommenting `npm run build`

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

# Start development server
CMD ["npm", "run", "dev"]
