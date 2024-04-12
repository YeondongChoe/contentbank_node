const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const generatePDF = require("./src/utils/pdfGenerator.js");

const app = express();
app.use(bodyParser.json());
const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello world");
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

//메소드 및 헤더 허용 설정
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", req.headers.origin); // 실제 요청이 온 origin을 설정
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.header("Access-Control-Allow-Credentials", true);
//   if (req.method === "OPTIONS") {
//     res.sendStatus(200); // Preflight 요청에 대한 응답
//   } else {
//     next();
//   }
// });

app.set("view engine", "ejs");

app.post("/get-pdf", async (req, res) => {
  const { title, content, column } = req.body;
  // 데이터 및 CSS 스타일
  const data = {
    title: title,
    content: content,
    column: column,
  };

  // PDF 생성 모듈 호출
  const pdfBuffer = await generatePDF(data);

  const filePath = "/app/수학문제.pdf";
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
  // res.contentType("application/pdf");
  // res.send(pdfBuffer);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.use(
//   cors({
//     origin: [
//       "http://210.124.177.36:3000",
//       "http://localhost:3000",
//       "https://j-dev01.dreamonesys.co.kr",
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

//mathjax는 TeX외에 다른 형태는 지원하지 못함 '\\frac{1}{x^2-1}'
// app.get("/get-math", (req, res) => {
//   const config = {
//     loader: {
//       load: ["[tex]/html"],
//     },
//     tex: {
//       packages: { "[+]": ["html"] },
//       inlineMath: [
//         ["$", "$"],
//         ["\\(", "\\)"],
//       ],
//       displayMath: [
//         ["$$", "$$"],
//         ["\\[", "\\]"],
//       ],
//     },
//   };

//   require("mathjax")
//     .init({ ...config, loader: { load: ["input/tex", "output/svg"] } })
//     .then((MathJax) => {
//       const svg = MathJax.tex2svg(exampleMathML, { display: true });
//       const svgString = MathJax.startup.adaptor.outerHTML(svg);
//       res.send({ svg: svgString });
//     });
// });

//mathjax-node: HTML태그를 읽지 못함
// app.get("/get-math", (req, res) => {
//   mjAPI.config({
//     loader: {
//       load: ["[tex]/html"],
//     },
//     tex: {
//       packages: { "[+]": ["html"] },
//       inlineMath: [
//         ["$", "$"],
//         ["\\(", "\\)"],
//       ],
//       displayMath: [
//         ["$$", "$$"],
//         ["\\[", "\\]"],
//       ],
//     },
//     svg: {
//       fontCache: "global",
//     },
//   });
//   mjAPI.start();
//   mjAPI.typeset(
//     {
//       math: exampleMathML,
//       format: "MathML",
//       svg: true,
//     },
//     function (data) {
//       if (!data.errors) {
//         res.send({ svg: data.svg });
//         console.log(data.svg);
//       }
//     }
//   );
// });

// // 초기화
// mj.start();

// // MathML을 SVG로 변환하는 함수
// const convertMathMLToSVG = async (mathML) => {
//   return new Promise((resolve, reject) => {
//     mj.typeset(
//       {
//         math: mathML,
//         format: "MathML",
//         svg: true,
//       },
//       (data) => {
//         if (!data.errors) {
//           resolve(data.svg);
//         } else {
//           reject(new Error("Failed to convert MathML to SVG"));
//         }
//       }
//     );
//   });
// };
