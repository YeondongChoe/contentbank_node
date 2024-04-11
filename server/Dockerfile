FROM node:18

RUN apt-get update && \
    apt-get install -y \
        libnss3 \
        libdbus-1-3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libxkbcommon0 \
        libasound2 \
        fonts-nanum

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force
RUN rm -rf /tmp/*
RUN rm -rf node_modules package-lock.json
RUN npm install --force

COPY . .

EXPOSE 5050

CMD ["npm", "start"]