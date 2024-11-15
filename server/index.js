import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Eureka } from "eureka-js-client";

import { ftpConfig, isFtpConfigured } from "./config/ftp.js";
import { bucketName, isS3Configured, s3Config } from "./config/s3.js";
import { generatePDF } from "./src/utils/pdfGenerator.js";
import {
  saveImageLocally,
  saveImageToFTP,
  saveImageToS3,
} from "./src/utils/imageUpload.js";
import qnapiDreamRouter from "./routes/qnapi_dream_bak.js"; // iTex

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5050;

// Eureka client setup
const eurekaClient = new Eureka({
  instance: {
    app: "file-service",
    hostName: "file-service",
    ipAddr: "127.0.0.1",
    port: {
      $: port,
      "@enabled": "true",
    },
    vipAddress: "file-service",
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },
  eureka: {
    host: "210.124.177.35",
    // host: 'localhost',
    port: 8761,
    servicePath: "/eureka/apps/",
  },
});

// Middleware
app.use(
  cors({
    // origin: true,
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.set("view engine", "ejs");

// images 디렉토리를 외부에서 접근 가능하도록 설정
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/hml_images", express.static(path.join(__dirname, "hml_images")));

// Routes
app.get("/", (req, res) => res.send("Hello world"));

app.post("/get-pdf", async (req, res) => {
  try {
    const { title, content, column, uploadDir, fileName } = req.body;
    const data = { title, content, column, uploadDir, fileName };

    await fs.mkdir(uploadDir, { recursive: true });

    const pdfBuffer = await generatePDF(data);
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, pdfBuffer);
    res.send("File saved successfully");
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).send("Error saving file");
  }
});

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload_img", upload.single("file"), async (req, res) => {
  try {
    let { img_save_type } = req.body;

    if (!img_save_type || !req.file) {
      img_save_type = 1;
      // throw new Error('Missing required data');
    }

    const imgSaveTypeInt = parseInt(img_save_type, 10);
    const imgUUID = uuidv4();
    const [year, month, day] = new Date()
      .toISOString()
      .split("T")[0]
      .split("-");
    const fileExtension = path.extname(req.file.originalname);

    const savePath = path.join(year, month, day, `${imgUUID}${fileExtension}`);
    let imgURL;

    switch (imgSaveTypeInt) {
      case 1:
        await saveImageLocally(
          path.join(__dirname, "images", savePath),
          req.file.buffer
        );
        imgURL = `/images/${savePath}`; // 로컬 저장 시 URL
        console.log("Image saved locally");
        break;
      case 2:
        if (isFtpConfigured) {
          await saveImageToFTP(ftpConfig, savePath, req.file.buffer);
          imgURL = `ftp://${ftpConfig.host}/${savePath}`; // FTP URL
          console.log("Image saved to FTP");
        } else {
          console.warn("FTP is not configured. Falling back to local storage.");
          await saveImageLocally(
            path.join(__dirname, "images", savePath),
            req.file.buffer
          );
          imgURL = `/images/${savePath}`; // 로컬 저장 시 URL (FTP 폴백)
          console.log("Image saved locally (FTP fallback)");
        }
        break;
      case 3:
        if (isS3Configured) {
          const s3Url = await saveImageToS3(
            s3Config,
            bucketName,
            savePath,
            req.file.buffer
          );
          imgURL = s3Url; // S3 URL
          console.log("Image saved to S3");
        } else {
          console.warn("S3 is not configured. Falling back to local storage.");
          await saveImageLocally(
            path.join(__dirname, "images", savePath),
            req.file.buffer
          );
          imgURL = `/images/${savePath}`; // 로컬 저장 시 URL (S3 폴백)
          console.log("Image saved locally (S3 fallback)");
        }
        break;
      default:
        throw new Error("Invalid save type");
    }

    res.json({
      imgUUID,
      imgURL,
      message: "Image uploaded successfully",
      actualStorage: getActualStorageType(imgSaveTypeInt),
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({
      error: "Error processing upload",
      details: error.message,
    });
  }
});

function getActualStorageType(imgSaveTypeInt) {
  switch (imgSaveTypeInt) {
    case 1:
      return "local";
    case 2:
      return isFtpConfigured ? "ftp" : "local (FTP fallback)";
    case 3:
      return isS3Configured ? "s3" : "local (S3 fallback)";
    default:
      return "unknown";
  }
}

app.use("/qnapi_dream", qnapiDreamRouter);

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
