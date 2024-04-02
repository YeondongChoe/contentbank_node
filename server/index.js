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

app.use(
  cors({
    origin: "http://localhost:3000", // 클라이언트의 주소로 변경
    credentials: true,
  })
);

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

  // PDF를 클라이언트로 전송
  res.contentType("application/pdf");
  res.send(pdfBuffer);
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
