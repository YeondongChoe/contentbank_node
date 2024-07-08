const ejs = require("ejs");
const puppeteer = require("puppeteer");

async function generatePDF(data) {
  //console.log(data);

  const questions = data.content.map((item) => {
    const questionContent =
      item.quizItemList.find((quiz) => quiz.type === "QUESTION")?.content ||
      "No question content";
    return { num: item.num, content: questionContent, height: item.height };
  });
  //console.log(questions);

  const cssStyles = `
    @page {
      size: A4;
      margin: 20px 10px 10px 10px;
    }
    body {
      font-family: Consolas, monaco;
    }
    .firstPage {
      border: 1px solid #a3aed0;
      border-radius: 10px;
      min-height: 1050px;
      margin-bottom: 10px;
    }
    .page {
      border: 1px solid #a3aed0;
      border-radius: 10px;
      min-height: 1050px;
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
      width: 48%;
    }
    .content {
      display: flex;
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
    //const questionHeight = questions.height;
    let allArray = []; // 모든 배열
    let remainingItems = [];

    questions.forEach((question) => {
      const questionWithHeight = { question, totalHeight };
      totalHeight += question.height;
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
      totalHeight = 0;
      allArray = remainingItems.map((item) => {
        totalHeight += item.question.height;
        return {
          question: item.question,
          totalHeight,
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
    let pageHtml = "";

    if (currentPage === 1) {
      pageHtml = '<div class="firstPage">';
    } else {
      pageHtml = '<div class="page">';
    }

    if (currentPage === 1) {
      pageHtml += `
        <div class="header">
          <div class="headerLeft">
            <div class="leftTop">
              <div style="font-size: 20px;"><span style="color: blue;"> </span></div>
              <div style="font-size: 14px; color: gray; padding-top: 5px"></div>
            </div>
            <div class="leftBottom">
              <div style="font-size: 14px;">${questions.length}문항</div>
            </div>
          </div>
          <div class="headerRight">
            <div></div>
            <div class="inputWrapper">
              <div style="font-size: 14px;">이름</div>
              <input style="border: none; border-bottom: 1px solid gray; margin-left: 5px; font-size: 8px;"></input>
            </div>
          </div>
        </div>`;
    }

    pageHtml += `<div class="viewer">`;

    // 좌측 배열의 HTML 생성
    const leftHtml = leftArray
      .map(
        (item) =>
          `<div class="content">${item.question.num}${item.question.content}</div>`
      )
      .join("");

    // 우측 배열의 HTML 생성
    const rightHtml = rightArray
      .map(
        (item) =>
          `<div class="content">${item.question.num}${item.question.content}</div>`
      )
      .join("");
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
