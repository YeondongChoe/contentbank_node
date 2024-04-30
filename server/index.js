const fs = require("fs");
// const https = require("https");
// const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const generatePDF = require("./src/utils/pdfGenerator.js");
const Eureka = require("eureka-js-client").Eureka; // Eureka 클라이언트 추가

const app = express();
const port = 5050;

// const path = require("path");
// const options = require("./src/config/pem_config").options;
// const httpApp = express();
// const port1 = 5051;

// 인증서 파일의 경로 설정
// const privateKeyPath = path.resolve(__dirname, "cert/key.pem");
// const certificatePath = path.resolve(__dirname, "cert/csr.pem");

// SSL 인증서 읽어오기
// const privateKey = fs.readFileSync(privateKeyPath, "utf8");
// const certificate = fs.readFileSync(certificatePath, "utf8");
// SSL 인증서 설정
// const credentials = { key: privateKey, csr: certificate };

// const httpsServer = https.createServer(options, app);

// HTTPS 서버로 리다이렉트하는 미들웨어
// httpApp.use((req, res, next) => {
//   // HTTPS 요청인지 확인
//   if (req.secure) {
//     // HTTPS 요청인 경우 다음 미들웨어로 이동
//     next();
//   } else {
//     // HTTP 요청인 경우 HTTPS로 리다이렉트
//     res.redirect(`https://${req.headers.host}${req.url}`);
//   }
// });

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
app.use(
  cors({
    origin: true, // 실제 요청이 온 origin을 허용
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true, // 자격 증명 허용
  })
);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello world");
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

  // PDF를 클라이언트로 전송
  //res.contentType("application/pdf");
  //res.send(pdfBuffer);
});

// HTTPS 서버는 5050 포트에서 리스닝하도록 설정
// httpsServer.listen(port, () => {
//   console.log(`HTTPS Server is running on port ${port}`);
// });

// HTTP 서버는 5051 포트에서리스닝하도록 설정
// const httpServer = http.createServer(httpApp);
// httpServer.listen(port1, () => {
//   console.log(`HTTP Server is running on port 5051`);
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
