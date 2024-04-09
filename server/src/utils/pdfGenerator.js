const ejs = require("ejs");
const puppeteer = require("puppeteer");

async function generatePDF(data) {
  const title = data.title;
  const content = data.content;
  const column = data.column;

  const cssStyles = `
    @page {
      size: A4;
      margin: 10px 10px 10px 0;
    }
    body {
      font-family: Consolas, monaco;
    }
    .page {
      border: 1px solid #a3aed0;
      border-radius: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #a3aed0;
      padding: 20px 10px;
    }
    .headerLeft, .headerRight {
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .leftTop {
      font-weight: bold;
    }
    .inputWrapper {
      display: flex;
    }
    .viewer {
      display: flex;
    }
    .left, .right {
      flex: 1;
      box-sizing: border-box;
      padding: 20px;
    }
    .center {
      display: flex;
      justify-content: center;
      flex: 1;
      box-sizing: border-box;
      padding: 20px;
    }
  `;

  const mathJaxScript = document.createElement("script");
  mathJaxScript.type = "text/javascript";
  mathJaxScript.async = true;
  mathJaxScript.onload = function () {
    // MathJax가 로드된 후에 실행될 콜백 함수
    MathJax.typesetPromise()
      .then(() => {
        // 수식이 성공적으로 렌더링된 후에 실행될 코드
        console.log("MathJax typesetting complete");
      })
      .catch((err) => {
        // 수식 렌더링 중에 오류가 발생한 경우 처리할 코드
        console.error("MathJax typesetting error:", err);
      });
  };
  mathJaxScript.src =
    "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";

  // Body에 MathJax 스크립트 추가
  document.body.appendChild(mathJaxScript);

  // 데이터에서 수식을 가져와 LaTeX로 변환 후 HTML에 삽입
  const contentElement = document.getElementById("content");
  contentElement.innerHTML = data.content; // 데이터에서 HTML 형식의 수식을 가져옴

  // 수식을 MathJax로 처리하도록 명령
  MathJax.typeset([contentElement]);

  const html = ejs.render(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <!-- CSS 스타일 적용 -->
      <style>
        ${cssStyles}
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="headerLeft">
            <div class="leftTop">
              <div style="font-size: 20px;"><span style="color: blue;">기본 </span>중 1-1</div>
              <div style="font-size: 14px; color: gray; padding-top: 5px">소인수분해</div>
            </div>
            <div class="leftBottom">
              <div style="font-size: 14px;">50문항 | 콘텐츠뱅크</div>
            </div>
          </div>
          <div class="headerRight">
            <div>이미지 아이콘</div>
            <div class="inputWrapper">
              <div style="font-size: 14px;">2024.02.27 이름</div>
              <input style="border: none; border-bottom: 1px solid gray; margin-left: 5px; font-size: 8px;"></input>
            </div>
          </div>
        </div>
        <div class="viewer">
        ${
          column === 1
            ? `<div class="center" style= "display: flex; flex-direction: column;">
                 ${content}
                 ${content}
                 ${content}
                 ${content}
                 ${content}
               </div>`
            : `<div class="left">
                ${content}
                ${contentElement.innerHTML} 
               </div>
               <div class="right">
                 ${content}
                 ${contentElement.innerHTML} 
               </div>`
        }
        </div>
      </div>
    </body>
    </html>
  `,
    data
  );

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html);

  const pdfBuffer = await page.pdf();

  await browser.close();

  return pdfBuffer;
}

module.exports = generatePDF;
