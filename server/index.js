const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const generatePDF = require("./src/utils/pdfGenerator.js");
const Eureka = require("eureka-js-client").Eureka; // Eureka 클라이언트 추가

const app = express();
const port = 5050;

// Eureka 클라이언트 설정
const client = new Eureka({
  instance: {
    app: "file-service", // 서비스 이름
    hostName: "file-service", // 서비스 호스트명
    ipAddr: "127.0.0.1", // 서비스 IP 주소
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
    host: "210.124.177.35", // Eureka 서버 호스트
    port: 8761, // Eureka 서버 포트
    servicePath: "/eureka/apps/",
  },
});

// Eureka 클라이언트 시작
client.start((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Eureka client started");
  }
});

// 모든 요청에 대해 CORS 미들웨어 적용
// app.use(
//   cors({
//     origin: true, // 실제 요청이 온 origin을 허용
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
//     credentials: true, // 자격 증명 허용
//   })
// );

//app.use(bodyParser.json());

// 요청 본문 크기 제한을 50MB로 설정
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Hello worldd");
});

app.set("view engine", "ejs");

app.post("/get-pdf", async (req, res) => {
  const { title, content, column, uploadDir, fileName } = req.body;
  // 데이터 및 CSS 스타일
  const data = {
    title: title,
    content: content,
    column: column,
    uploadDir: uploadDir,
    fileName: fileName,
  };
  // 파일 저장할 디렉토리 경로
  //const uploadDir = "/usr/share/nginx/html/CB";

  // 디렉토리가 존재하지 않으면 생성
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // PDF 생성 모듈 호출
  const pdfBuffer = await generatePDF(data);

  // 파일 저장 경로
  const filePath = `${uploadDir}/${fileName}`;

  // 파일 저장
  fs.writeFile(filePath, pdfBuffer, (err) => {
    if (err) {
      console.error("파일 저장 중 오류 발생:", err);
      res.status(500).send("파일 저장 중 오류가 발생했습니다.");
    } else {
      console.log("파일이 성공적으로 저장되었습니다:", filePath);
      res.send("파일이 성공적으로 저장되었습니다.");
    }
  });
});

// itex 추가 내용 =======================================================
const tempDir = path.join(__dirname, "routes", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}
// 허용 url
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3006",
  "http://43.201.205.140:40031",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
// multer 파일 설정
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 로컬 저장 방식
const dream_img_save_dir = path.join(__dirname, "images");
const saveImageLocally = (savePath, fileBuffer) => {
  fs.mkdirSync(path.dirname(savePath), { recursive: true });
  fs.writeFileSync(savePath, fileBuffer);
};

const { ftpConfig } = require("./configs/ftp_img_save.js");
// FTP 저장 방식
const saveImageToFTP = (ftpConfig, savePath, fileBuffer) => {
  const client = new FTPClient();
  client.on("ready", () => {
    client.put(fileBuffer, savePath, (err) => {
      if (err) console.error("Error uploading file via FTP:", err);
      else console.log("File uploaded via FTP.");
      client.end();
    });
  });
  client.connect(ftpConfig);
};

const { s3Config, bucketName } = require("./configs/s3_img_save");
// AWS S3 저장 방식
const saveImageToS3 = (s3Config, bucketName, key, fileBuffer) => {
  const s3 = new AWS.S3(s3Config);
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ACL: "public-read",
  };
  s3.upload(params, (err, data) => {
    if (err) console.error("Error uploading file to S3:", err);
    else console.log("File uploaded to S3:", data.Location);
  });
};

// 단문항 편집에서 문항 저장 시, 해당 문항
app.post("/uploadImage", upload.single("file"), async (req, res) => {
  try {
    const img_save_type = req.body.img_save_type;
    console.log("img_save_type:", img_save_type);

    if (!img_save_type) {
      throw new Error("img_save_type is missing");
    }

    if (!req.file) {
      throw new Error("File is missing");
    }

    const imgSaveTypeInt = parseInt(img_save_type, 10);
    console.log("img_save_type (as integer):", imgSaveTypeInt);

    const imgUUID = uuidv4();
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");

    switch (imgSaveTypeInt) {
      case 1:
        savePath = path.join(
          dream_img_save_dir,
          year,
          month,
          day,
          imgUUID + path.extname(req.file.originalname)
        );
        console.log("savePath (Local):", savePath);
        saveImageLocally(savePath, req.file.buffer);
        break;

      case 2:
        savePath = path.join(
          dream_img_save_dir,
          year,
          month,
          day,
          imgUUID + path.extname(req.file.originalname)
        );
        console.log("savePath (FTP):", savePath);
        saveImageToFTP(ftpConfig, savePath, req.file.buffer);
        break;

      case 3:
        key = `${year}/${month}/${day}/${imgUUID}${path.extname(
          req.file.originalname
        )}`;
        console.log("key (S3):", key);
        saveImageToS3(s3Config, bucketName, key, req.file.buffer);
        break;

      default:
        throw new Error("Invalid save type");
    }

    res.json({ imgUUID });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).send("Error processing upload");
  }
});

const qnapiHmlupRouter = require("./routes/qnapi_dream");
app.use((req, res, next) => {
  app.use("/qnapi_dream", qnapiHmlupRouter);
  next();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
