# Alpine 최신 버전 사용
FROM alpine:latest

# Node.js 22 설치를 위한 저장소 추가 및 기본 패키지 설치
RUN apk update && \
    apk add --no-cache \
        build-base \
        wget \
        curl \
        perl \
        perl-dev \
        imagemagick \
        imagemagick-dev \
        nss \
        dbus \
        libatk-1.0 \
        at-spi2-core \
        cups-libs \
        mesa-gbm \
        libdrm \
        libxcomposite \
        libxdamage \
        libxfixes \
        libxrandr \
        libxkbcommon \
        alsa-lib \
        font-noto-cjk \
        tzdata \
        bash \
        gcc \
        make \
        openssl \
        openssl-dev \
        zlib-dev \
        npm

# Node.js 최신버전 설치
RUN apk add --no-cache nodejs-current

# Perlbrew 설치 및 Perl 5.26 설치
ENV PERLBREW_ROOT=/opt/perl5/perlbrew
ENV PATH=${PERLBREW_ROOT}/bin:${PATH}
RUN curl -L https://install.perlbrew.pl | bash && \
    perlbrew init && \
    perlbrew install-patchperl && \
    perlbrew install perl-5.26.1 --notest -j $(nproc) && \
    perlbrew switch perl-5.26.1

# Shell 초기화 스크립트 추가
RUN echo 'source ${PERLBREW_ROOT}/etc/bashrc' >> ~/.bashrc && \
    echo 'source ${PERLBREW_ROOT}/etc/bashrc' >> ~/.profile

# 모든 셸에서 Perl 5.26을 기본값으로 설정
ENV PERLBREW_PERL=perl-5.26.1
ENV PATH=${PERLBREW_ROOT}/perls/perl-5.26.1/bin:${PATH}

# Perl 버전 확인
RUN /bin/bash -c "source ${PERLBREW_ROOT}/etc/bashrc && perl -v"

# Perl 버전 확인
RUN perl -v

# Node.js 버전 확인
RUN node -v

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