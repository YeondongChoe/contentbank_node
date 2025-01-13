import dotenv from 'dotenv';

dotenv.config();

const eurekaConfig = {
    instance: {
        app: "file-service",
        hostName: "file-service",
        ipAddr: "127.0.0.1",
        port: {
            $: process.env.PORT || 5050,
            "@enabled": "true",
        },
        vipAddress: "file-service",
        dataCenterInfo: {
            "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
            name: "MyOwn",
        },
    },
    eureka: {
        host: process.env.EUREKA_HOST,
        port: parseInt(process.env.EUREKA_PORT),
        servicePath: "/eureka/apps/",
    },
};

export default eurekaConfig;

