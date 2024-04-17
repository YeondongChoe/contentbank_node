const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const generatePDF = require("./src/utils/pdfGenerator.js");
const app = express();

// HTTP 서버는 5050 포트에서 리스닝하도록 설정
const httpServer = http.createServer(app);

// HTTPS 서버는 5051 포트에서 리스닝하도록 설정
const httpsServer = https.createServer({}, app);

// HTTPS 서버에서 HTTP로 리다이렉션하는 미들웨어 함수
httpServer.on("request", (req, res) => {
  const Location = `http://${req.headers.host}${req.url}`;
  console.log(Location);
  // HTTP 301 Moved Permanently 상태 코드와 함께 리다이렉션을 수행
  res.writeHead(301, { Location });
  res.end();
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

// Preflight 요청에 대한 응답 처리
app.options("*", (req, res) => {
  res.sendStatus(200);
});

app.use(bodyParser.json());
const port = 5050;
const port1 = 5051;

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
      console.log(__dirname);
      // /app
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
httpsServer.listen(5050, () => {
  console.log(`HTTPS Server is running on port 5050`);
});

// HTTP 서버는 5050 포트에서 리스닝하도록 설정
httpServer.listen(5051, () => {
  console.log(`HTTP Server is running on port 5051`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
