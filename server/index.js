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

  // 임시 파일 경로 (PDF 데이터를 임시 파일로 저장)
  const tempFilePath = `${uploadDir}/temp_${fileName}`;

  // 임시 파일로 저장
  fs.writeFile(tempFilePath, pdfBuffer, (err) => {
    if (err) {
      console.error("임시 파일 저장 중 오류 발생:", err);
      res.status(500).send("임시 파일 저장 중 오류가 발생했습니다.");
    } else {
      console.log("임시 파일이 성공적으로 저장되었습니다:", tempFilePath);

      // 스트리밍 방식으로 파일 저장
      const readStream = fs.createReadStream(tempFilePath);
      const writeStream = fs.createWriteStream(`${uploadDir}/${fileName}`);

      readStream.pipe(writeStream);

      writeStream.on("finish", () => {
        console.log(
          "파일이 성공적으로 스트리밍되었습니다:",
          `${uploadDir}/${fileName}`
        );
        res.send("파일이 성공적으로 스트리밍되었습니다.");

        // 임시 파일 삭제
        fs.unlink(tempFilePath, (err) => {
          if (err) {
            console.error("임시 파일 삭제 중 오류 발생:", err);
          } else {
            console.log("임시 파일이 성공적으로 삭제되었습니다.");
          }
        });
      });

      writeStream.on("error", (err) => {
        console.error("파일 스트리밍 중 오류 발생:", err);
        res.status(500).send("파일 스트리밍 중 오류가 발생했습니다.");
      });
    }
  });

  // 파일 저장 경로
  // const filePath = `${uploadDir}/${fileName}`;

  // // 파일 저장
  // fs.writeFile(filePath, pdfBuffer, (err) => {
  //   if (err) {
  //     console.error("파일 저장 중 오류 발생:", err);
  //     res.status(500).send("파일 저장 중 오류가 발생했습니다.");
  //   } else {
  //     console.log("파일이 성공적으로 저장되었습니다:", filePath);
  //     res.send("파일이 성공적으로 저장되었습니다.");
  //   }
  // });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
