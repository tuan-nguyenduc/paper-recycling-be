FROM node:18-alpine

#Change directory
WORKDIR /app

# cache node_modules
COPY package.json .

# run command to install packages
RUN npm install

# copy my source code
COPY . .

# set port
EXPOSE 3000

# set environment variables
ENV NODE_ENV=production

#run seed
RUN npm run seed

# make uploads folder
RUN mkdir uploads


# run command to start the server
CMD ["npm", "run", "dev"]
