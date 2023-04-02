FROM node:16

COPY . /home/10014/ocr-be
# Create app directory
WORKDIR /home/10014/ocr-be

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev


EXPOSE 8080
USER 10014
CMD [ "node", "server.js" ]
