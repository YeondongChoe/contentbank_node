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
  ];

  const cssStyles = `
    @page {
      size: A4;
      margin: 10px 10px 10px 0;
    }
    body {
      font-family: Consolas, monaco;
    }
    .pageWrapper {
      display: flex;
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
    .left, .right {
      display: flex;
      flex-direction: column;
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

  // const generatePagesHtml = (questions) => {
  //   const pages = []; // 각 페이지의 HTML을 저장할 배열
  //   let leftArray = []; // 좌측 배열
  //   let rightArray = []; // 우측 배열
  //   let balanceArray = []; // 밸런스 배열

  //   let totalHeight = 0; // 현재까지의 높이
  //   let currentPage = 1; // 현재 페이지 번호

  //   questions.forEach((question) => {
  //     const questionHeight = 200; // 문항의 높이
  //     const thresholdHeight = 900; // 임계치 높이

  //     // 좌측 배열에 문항 추가
  //     leftArray.push(question);
  //     totalHeight += questionHeight;

  //     // 좌측 배열의 높이가 일정 높이를 초과하면 우측 배열에 이동
  //     if (totalHeight > thresholdHeight) {
  //       // 우측 배열에 추가
  //       rightArray.push(question);
  //       // 우측 배열의 높이 계산
  //       const rightTotalHeight = rightArray.length * questionHeight;
  //       // 우측 배열의 높이가 일정 높이를 초과하면 밸런스 배열에 이동
  //       if (rightTotalHeight > thresholdHeight) {
  //         balanceArray.push(question);
  //       }
  //     }
  //     console.log("leftArray:", leftArray);
  //     console.log("rightArray:", rightArray);
  //     console.log("balanceArray:", balanceArray);
  //     console.log("currentPage:", currentPage);

  //     // 좌우 배열이 완성된 페이지 생성
  //     if (leftArray.length > 0 && rightArray.length > 0) {
  //       const pageHtml = generatePage(leftArray, rightArray);
  //       pages.push(pageHtml);
  //       currentPage++;
  //       leftArray = [];
  //       rightArray = [];
  //     }
  //   });

  //   // 남은 문항이 있는 경우 처리
  //   if (balanceArray.length > 0) {
  //     // 재귀 호출을 통해 추가 페이지 생성
  //     pages.push(...generatePagesHtml(balanceArray));
  //   } else {
  //     // 남은 문항이 없는 경우 마지막 페이지 생성
  //     if (leftArray.length > 0) {
  //       const pageHtml = generatePage(leftArray, rightArray, currentPage);
  //       pages.push(pageHtml);
  //     }
  //   }

  //   return pages;
  // };
  const generatePagesHtml = (questions) => {
    const pages = []; // 각 페이지의 HTML을 저장할 배열
    let leftArray = []; // 좌측 배열
    let rightArray = []; // 우측 배열
    let balanceArray = []; // 밸런스 배열
    let currentPage = 1; // 현재 페이지 번호

    questions.forEach((question) => {
      const questionHeight = 200; // 문항의 높이
      const thresholdHeight = 900; // 임계치 높이

      // 좌측 배열에 문항 추가
      leftArray.push(question);

      // 좌측 배열의 높이가 일정 높이를 초과하면 우측 배열에 이동
      if (leftArray.length >= 4 && leftArray.length % 4 === 0) {
        rightArray = leftArray.splice(0, 4);
        pages.push(generatePage(leftArray, rightArray, currentPage));
        currentPage++;
      }

      // 현재 페이지가 1이 아니고 우측 배열이 있으면 좌측 배열에 우측 배열 추가
      if (currentPage !== 1 && rightArray.length > 0) {
        leftArray.push(...rightArray.splice(0, rightArray.length));
      }
    });

    // 마지막 페이지 처리
    if (leftArray.length > 0) {
      pages.push(generatePage(leftArray, rightArray, currentPage));
    }
    console.log("leftArray:", leftArray);
    console.log("rightArray:", rightArray);
    console.log("currentPage:", currentPage);

    return pages;
  };

  const generatePage = (leftArray, rightArray, currentPage) => {
    let pageHtml = '<div class="page">';

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
      .map(
        (question) =>
          `<div class="left">문제 ${question.id}. ${question.content}</div>`
      )
      .join("");

    // 우측 배열의 HTML 생성
    const rightHtml = rightArray
      .map(
        (question) =>
          `<div class="right">문제 ${question.id}. ${question.content}</div>`
      )
      .join("");

    pageHtml += leftHtml;
    pageHtml += rightHtml;

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
