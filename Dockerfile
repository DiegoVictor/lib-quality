FROM node:14
RUN mkdir /app
WORKDIR /app
COPY package*.json .
RUN npm install
EXPOSE 3333
COPY . .
CMD ["npm", "run", "dev:server"]
