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
const tex = new TeX({
  packages: AllPackages,
  displayMath: [["$$", "$$"]], // 디스플레이 수식을 $$로 지정
  inlineMath: [["$", "$"]], // 인라인 수식을 $로 지정
  processEscapes: true, // 이스케이프 문자 처리를 활성화
  processEnvironments: true, // 환경 처리를 활성화
});
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

  const findActualSVGNode = (node) => {
    // node가 실제 SVG 노드인지 확인합니다.
    if (node.kind === "svg") {
      return node;
    }

    // node가 LiteElement이고 children을 가지고 있다면,
    // 그 children 중에서 실제 SVG 노드를 찾습니다.
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const actualSVGNode = findActualSVGNode(child);
        if (actualSVGNode) {
          return actualSVGNode;
        }
      }
    }

    // 실제 SVG 노드를 찾지 못한 경우에는 null을 반환합니다.
    return null;
  };

  const convertedEquation = await htmlConverter.convert(content);
  const actualSVGNode = findActualSVGNode(convertedEquation);
  //const svgString = actualSVGNode.toString();
  const containerDiv = document.createElement("div");
  containerDiv.appendChild(actualSVGNode.toNode());
  document.body.appendChild(containerDiv);
  console.log(actualSVGNode.toNode());
  console.log(containerDiv);

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
                 ${svgString}
               </div>`
            : `<div class="left">
                 ${svgString}
               </div>
               <div class="right">
                 ${svgString}
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
