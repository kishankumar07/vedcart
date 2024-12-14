FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm install sharp --platform=linux --arch=x64 
COPY . .
EXPOSE 3000
CMD ["npm", "start"]