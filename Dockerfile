FROM node:16.14.0-alpine3.15

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000

RUN addgroup app && adduser -S -G app app
RUN mkdir node_modules/.cache
RUN chown app:app node_modules/.cache
USER app

CMD ["npm", "start"]