const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const generatePDF = require("./src/utils/pdfGenerator.js");

const app = express();
app.use(bodyParser.json());
const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello world\n");
});

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });

app.options(
  "*",
  cors({
    origin: [
      "http://210.124.177.36:3000",
      "http://localhost:3000",
      "https://j-dev01.dreamonesys.co.kr",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.options("*", cors());

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // 요청이 허용할 origin인지 확인합니다.
//       if (
//         [
//           "http://210.124.177.36:3000",
//           "http://localhost:3000",
//           "https://j-dev01.dreamonesys.co.kr",
//         ].indexOf(origin) !== -1 ||
//         !origin
//       ) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// 메소드 및 헤더 허용 설정
//app.options("*", cors());

// app.use((req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"); // 클라이언트의 주소
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);

//   res.end();
// });

app.set("view engine", "ejs");

app.post("/get-pdf", async (req, res) => {
  const { title, content, column } = req.body;
  console.log(req.body);
  // 데이터 및 CSS 스타일

  const data = {
    title: title,
    content: content,
    column: column,
  };

  // PDF 생성 모듈 호출
  const pdfBuffer = await generatePDF(data);

  // PDF를 클라이언트로 전송
  res.contentType("application/pdf");
  res.header("Access-Control-Allow-Credentials", true);
  res.send("Hello world\n");
  //res.send(pdfBuffer);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

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
