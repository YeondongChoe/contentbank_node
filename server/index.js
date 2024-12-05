import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {fileURLToPath} from "url";
import path from "path";
import fileRoutes from './src/routes/fileRoutes.js';
import {Eureka} from "eureka-js-client";
import eurekaConfig from './config/eureka.js';

import qnapiDreamRouter from "./routes/qnapi_dream.js"; // iTex

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const port = process.env.PORT || 5050;

// Eureka client setup
const eurekaClient = new Eureka(eurekaConfig);

const app = express();

// 미들웨어 설정
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// 정적 파일 설정
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/hml_images', express.static(path.join(__dirname, 'public/hml_images')));
app.use('/upload_img', express.static(path.join(__dirname, 'public/upload_img')));
app.use('/uploadImage', express.static(path.join(__dirname, 'public/uploadImage')));

// 라우트 설정
app.use('/', fileRoutes);
app.use('/qnapi_dream', qnapiDreamRouter);


// Start server
const startServer = async () => {
    try {
        await new Promise((resolve, reject) => {
            eurekaClient.start((err) => (err ? reject(err) : resolve()));
        });
        console.log("Eureka client started");

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();