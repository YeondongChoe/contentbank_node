# Ubuntu 18.04를 기본 이미지로 사용
FROM ubuntu:22.04

# Node.js 22 저장소 추가 (18 대신 16 사용)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

# 필요한 패키지들 설치
RUN apt-get update && \
    apt-get install -y \
        build-essential \
        curl \
        libmagickcore-dev \
        libmagickwand-dev \
        imagemagick \
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
        fonts-nanum \
        wget \
        bzip2 && \
    rm -rf /var/lib/apt/lists/*

	# Perl 5.26.1 설치
	# RUN wget https://www.cpan.org/src/5.0/perl-5.26.3.tar.gz && \
	# tar -xjf perl-5.26.3.tar.gz && \
	# cd perl-5.26.3 && \
	# ./Configure -des && \
	# make && \
	# make test && \
	# make install && \
	# cd .. && \
	# rm -rf perl-5.26.3 perl-5.26.3.tar.gz

# Perl 버전 확인
RUN perl -v

WORKDIR /app

COPY package*.json ./

# npm 캐시 및 불필요한 파일들 정리
RUN npm cache clean --force
RUN rm -rf /tmp/*
RUN rm -rf node_modules package-lock.json
RUN npm install --force

COPY . .

EXPOSE 5050

CMD ["npm", "start"]