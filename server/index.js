const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const generatePDF = require("./src/utils/pdfGenerator.js");
const path = require("path");
const app = express();

const port = 5050;

// 인증서 파일의 경로 설정
const privateKeyPath = path.resolve(__dirname, "../server/cert/key.pem");
const certificatePath = path.resolve(__dirname, "../server/cert/cert.pem");
// SSL 인증서 읽어오기
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const certificate = fs.readFileSync(certificatePath, "utf8");
// SSL 인증서 설정
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

// HTTPS 서버에서 HTTP로 리다이렉션하는 미들웨어 함수
// httpsServer.on("request", (req, res) => {
//   // HTTPS 서버에 HTTP 요청이 들어오면 HTTP로 리다이렉션
//   const redirectUrl = `http://${req.headers.host}${req.url}`;
//   res.writeHead(301, { Location: redirectUrl });
//   res.end();
// });

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
  const { title, content, column } = req.body;
  // 데이터 및 CSS 스타일
  const data = {
    title: title,
    content: content,
    column: column,
  };
  // 파일 저장할 디렉토리 경로
  const uploadDir = "/usr/share/nginx/html/CB";

  // 디렉토리가 존재하지 않으면 생성
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // PDF 생성 모듈 호출
  const pdfBuffer = await generatePDF(data);

  // 파일 저장 경로
  const filePath = `${uploadDir}/worksheettest.pdf`;

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

// HTTPS 서버는 5051 포트에서 리스닝하도록 설정
httpsServer.listen(port, () => {
  console.log(`HTTPS Server is running on port ${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
