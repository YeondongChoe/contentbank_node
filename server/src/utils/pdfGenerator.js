const ejs = require("ejs");
const puppeteer = require("puppeteer");
const mathjax = require("mathjax-full/js/mathjax.js").mathjax;
const TeX = require("mathjax-full/js/input/tex.js").TeX;
const SVG = require("mathjax-full/js/output/svg.js").SVG;
const liteAdaptor =
  require("mathjax-full/js/adaptors/liteAdaptor.js").liteAdaptor;
const RegisterHTMLHandler =
  require("mathjax-full/js/handlers/html.js").RegisterHTMLHandler;
const AllPackages =
  require("mathjax-full/js/input/tex/AllPackages.js").AllPackages;

// MathJax 설정
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: "none" });
const htmlConverter = mathjax.document("", { InputJax: tex, OutputJax: svg });

async function generatePDF(data) {
  const title = data.title;
  const content = data.content;
  const column = data.column;
  //console.log(data);

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

  const convertedEquation = await htmlConverter.convert(content);
  const htmlString = convertedEquation.children[0].toString();
  //console.log(content);
  //console.log(convertedEquation);
  console.log(htmlString);

  const htmlContent = ejs.render(
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
      <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
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
                 ${htmlString}
                 ${htmlString}
                 ${htmlString}
                 ${htmlString} 
                 ${htmlString}
               </div>`
            : `<div class="left">
                 ${htmlString}
               </div>
               <div class="right">
                 ${htmlString}
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
  await page.setContent(htmlContent);

  const pdfBuffer = await page.pdf();

  await browser.close();

  return pdfBuffer;
}

module.exports = generatePDF;
