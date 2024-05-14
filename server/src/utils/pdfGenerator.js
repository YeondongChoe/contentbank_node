const ejs = require("ejs");
const puppeteer = require("puppeteer");

async function generatePDF(data) {
  const title = data.title;
  // 가져온 문제 데이터 예시
  const questions = [
    { id: 1, content: data.content },
    { id: 2, content: data.content },
    { id: 3, content: data.content },
    { id: 4, content: data.content },
    { id: 5, content: data.content },
    { id: 6, content: data.content },
    { id: 7, content: data.content },
    { id: 8, content: data.content },
    { id: 9, content: data.content },
    { id: 10, content: data.content },
    { id: 11, content: data.content },
    { id: 12, content: data.content },
    { id: 13, content: data.content },
    { id: 14, content: data.content },
    { id: 15, content: data.content },
    { id: 16, content: data.content },
    { id: 17, content: data.content },
    { id: 18, content: data.content },
    { id: 19, content: data.content },
    { id: 20, content: data.content },
    { id: 21, content: data.content },
    { id: 22, content: data.content },
    { id: 23, content: data.content },
    { id: 24, content: data.content },
    { id: 25, content: data.content },
    { id: 26, content: data.content },
    { id: 27, content: data.content },
    { id: 28, content: data.content },
    { id: 29, content: data.content },
    { id: 30, content: data.content },
    { id: 31, content: data.content },
    { id: 32, content: data.content },
    { id: 33, content: data.content },
    { id: 34, content: data.content },
    { id: 35, content: data.content },
    { id: 36, content: data.content },
    { id: 37, content: data.content },
    { id: 38, content: data.content },
    { id: 39, content: data.content },
    { id: 40, content: data.content },
    { id: 41, content: data.content },
    { id: 42, content: data.content },
    { id: 43, content: data.content },
    { id: 44, content: data.content },
    { id: 45, content: data.content },
    { id: 46, content: data.content },
    { id: 47, content: data.content },
    { id: 48, content: data.content },
    { id: 49, content: data.content },
  ];

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
      min-height: 1000px;
      margin-bottom: 10px;
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
    .wrapper {
      padding: 20px;
    }
    .content {
    }
    .contentWrapper {
    }
    .number {
    }
    .center {
      display: flex;
      justify-content: center;
      flex: 1;
      box-sizing: border-box;
      padding: 20px;
    }
  `;

  // margin-bottom: 10px;

  const generatePagesHtml = (questions) => {
    const pages = []; // 각 페이지의 HTML을 저장할 배열
    let currentPage = 1; // 현재 페이지 번호
    let leftArray = []; // 좌측 배열
    let rightArray = []; // 우측 배열
    let totalHeight = 0; // 현재까지의 높이
    const questionHeight = 200;
    let allArray = []; // 모든 배열
    let remainingItems = [];

    questions.forEach((question) => {
      const questionWithHeight = { question, totalHeight };
      totalHeight += questionHeight;
      allArray.push(questionWithHeight);
    });
    console.log("allArray:", allArray);

    // allArray 생성 및 조건에 따른 배열 분배
    while (true) {
      // leftArray에 높이가 800까지인 문항 넣기
      leftArray = allArray.filter((item) => item.totalHeight <= 800);
      console.log("leftArray:", leftArray);

      // rightArray에 높이가 800초과 1600까지인 문항 넣기
      rightArray = allArray.filter(
        (item) => item.totalHeight > 800 && item.totalHeight <= 1600
      );
      console.log("rightArray:", rightArray);
      remainingItems = allArray.filter((item) => item.totalHeight > 1600);
      console.log("remainingItems:", remainingItems);
      allArray = [];
      allArray = remainingItems.map((item, index) => {
        const newId = index + 1; // id를 1부터 시작하도록 설정
        const newTotalHeight = index * questionHeight; // totalHeight를 200씩 증가시키며 설정
        return {
          question: { id: newId, content: item.question.content },
          totalHeight: newTotalHeight,
        };
      });
      remainingItems = [];
      console.log("allArray:", allArray);
      console.log("remainingItems:", remainingItems);

      // 페이지 생성
      pages.push(generatePage(leftArray, rightArray, currentPage));
      currentPage++;

      if (allArray.length === 0) break;
    }

    return pages;
  };

  const generatePage = (leftArray, rightArray, currentPage) => {
    let pageHtml = '<div class="page" style="min-height: 1200px;">';

    if (currentPage === 1) {
      pageHtml += `
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
            <div>이미지</div>
            <div class="inputWrapper">
              <div style="font-size: 14px;">2024.02.27 이름</div>
              <input style="border: none; border-bottom: 1px solid gray; margin-left: 5px; font-size: 8px;"></input>
            </div>
          </div>
        </div>`;
    }

    pageHtml += `<div class="viewer">`;

    // 좌측 배열의 HTML 생성
    const leftHtml = leftArray
      .map((item) => `<div class="content">${item.question.content}</div>`)
      .join("");

    // 우측 배열의 HTML 생성
    const rightHtml = rightArray
      .map((item) => `<div class="content">${item.question.content}</div>`)
      .join("");
    //${item.question.id}
    pageHtml += `<div class="wrapper">${leftHtml}</div>`;
    pageHtml += `<div class="wrapper">${rightHtml}</div>`;

    pageHtml += `
      </div>
    </div>`;

    return pageHtml;
  };

  // HTML 생성
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
    ${generatePagesHtml(questions).join("")}
  </body>
  </html>
`,
    data
  );

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  //await page.setDefaultNavigationTimeout(60000);
  await page.setContent(htmlContent);

  const pdfBuffer = await page.pdf();

  await browser.close();

  return pdfBuffer;
}

module.exports = generatePDF;
