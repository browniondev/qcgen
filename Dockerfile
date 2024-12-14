FROM --platform=arm64 node:20
WORKDIR  /app
COPY package.json .
RUN npm install
COPY . /app/

EXPOSE 3000 443
CMD [ "npm", "run", "dev" ]