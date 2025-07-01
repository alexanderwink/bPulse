FROM node:24-alpine

WORKDIR /app

COPY . .

RUN npm install -g serve@14.2.4 pm2@5.4.3 && \
    npm install

EXPOSE 8080

RUN chown -R node:node /app

USER node

CMD ["pm2-runtime", "pm2.json"]