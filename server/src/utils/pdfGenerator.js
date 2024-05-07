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
    // { id: 7, content: data.content },
    // { id: 8, content: data.content },
    // { id: 9, content: data.content },
    // { id: 10, content: data.content },
    // { id: 11, content: data.content },
    // { id: 12, content: data.content },
    // { id: 13, content: data.content },
    // { id: 14, content: data.content },
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

  let currentPage = 1; // 현재 페이지
  let pages = []; // 각 페이지의 HTML을 저장할 배열
  let pageHtml = "";
  // 페이지 HTML 구성
  if (currentPage === 1) {
    pageHtml += `
    <div class="pageWrapper">
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
            <div>이미지</div>
            <div class="inputWrapper">
              <div style="font-size: 14px;">2024.02.27 이름</div>
             <input style="border: none; border-bottom: 1px solid gray; margin-left: 5px; font-size: 8px;"></input>
           </div>
          </div>
        </div>
  `;
  }
  pageHtml += '<div class="viewer" style="height: 950px;">';

  const generatePages = (questions) => {
    if (currentPage !== 1) {
      pageHtml +=
        '<div class="pageWrapper"><div class="page"><div class="viewer" style="height: 950px;">';
    }

    let remainArray = [];
    let totalLeftHeight = 0; // 좌측 배열의 높이
    let totalRightHeight = 0; // 우측 배열의 높이

    questions.forEach((question) => {
      let leftHtml = ""; // 좌측에 표시할 HTML 문자열
      let rightHtml = ""; // 우측에 표시할 HTML 문자열
      let questionHeight = 200;
      let leftPositionArray = [];
      let rightPositionArray = [];

      // 높이가 900을 초과하는 경우 우측배열 추가
      if (totalLeftHeight + questionHeight > 900) {
        //초과한 문제 우측 배열에 추가
        rightPositionArray.push(question);
        console.log("Right Position Array:", rightPositionArray);
      } else {
        // 좌측 배열에 추가
        leftPositionArray.push(question);
        console.log("Left Position Array:", leftPositionArray);

        // 높이 추가
        totalLeftHeight += questionHeight;
        console.log("totalLeftHeight:", totalLeftHeight);
      }
      //좌측 좌측 HTML 구성
      leftPositionArray.forEach((question) => {
        const questionHtml = `<div class="left">문제 ${question.id}. ${question.content}</div>`;
        leftHtml += questionHtml;
        pageHtml += `<div class="left">${leftHtml}</div>`;
      });
      // 좌측 HTML 구성
      // leftHtml = leftPositionArray
      //   .map(
      //     (question) =>
      //       `<div class="left">문제 ${question.id}. ${question.content}</div>`
      //   )
      //   .join("");
      // console.log("leftHtml:", leftHtml);

      // 우측 HTML 구성
      if (rightPositionArray.length > 0) {
        rightPositionArray.forEach((question) => {
          // 높이가 900을 초과하는 경우
          if (totalRightHeight + questionHeight > 900) {
            //초과한 문제 나머지 배열에 추가
            remainArray.push(question);
            console.log("remainArray:", remainArray);
          } else {
            // 높이가 900을 초과하지 않는 경우 우측 HTML 구성
            const questionHtml = `<div class="right">문제 ${question.id}. ${question.content}</div>`;
            rightHtml += questionHtml;
            pageHtml += `<div class="right">${rightHtml}</div>`;
            // rightHtml = rightPositionArray
            //   .map(
            //     (question) =>
            //       `<div class="right">문제 ${question.id}. ${question.content}</div>`
            //   )
            //   .join("");
            // console.log("rightHtml:", rightHtml);
            totalRightHeight += questionHeight;
            console.log("totalRightHeight:", totalRightHeight);
            pageHtml += "</div></div>";
          }
        });
      }

      //   pageHtml += `
      //     <div class="viewer">
      //       <div class="left">${leftHtml}</div>
      //       <div class="right">${rightHtml}</div>
      //     </div>
      //   </div>
      // `;

      pages.push(pageHtml);

      // 페이지 초기화
      leftPositionArray = []; // 좌측 배열 초기화
      rightPositionArray = []; // 우측 배열 초기화
      let totalLeftHeight = 0; // 좌측 배열의 초기화
      let totalRightHeight = 0; // 우측 배열의 초기화
      leftHtml = "";
      rightHtml = "";
      currentPage++;
    });

    // RemainArray에 남은 문제가 있는지 확인하여 처리
    if (remainArray.length > 0) {
      generatePages(remainArray); // 재귀 호출로 추가 페이지 생성
    } else {
      pageHtml += "</div>";
    }
  };

  // 함수 호출
  generatePages(questions);

  const allPagesHtml = pages
    .map(
      (pageHtml, index) =>
        `<!-- 페이지 ${index + 1} 시작 -->${pageHtml}<!-- 페이지 ${
          index + 1
        } 끝 -->`
    )
    .join("");

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
    ${allPagesHtml}
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

// 우측으로 넘어가는 경우
// if (
//   (rightHtml !== "" && totalHeight + questionHeight > 1600) ||
//   currentPage === 1
// ) {
//   pageHtml += `</div></div>`; // 현재 페이지 마감
//   pages.push(pageHtml); // 현재 페이지를 배열에 추가합니다.
//   // 새 페이지를 시작합니다.
//   currentPage++;
//   pageHtml =
//     '<div class="page"><div class="viewer" style="height: 1100px;">'; // 새 페이지 생성
//   leftHtml = ""; // 좌측 HTML 초기화
//   rightHtml = ""; // 우측 HTML 초기화
//   totalHeight = 0; // 높이 초기화
//   if (totalHeight + questionHeight > 800) {
//     rightHtml += `<div class="right">문제 ${question.id}. ${question.content}</div>`;
//   } else {
//     leftHtml += questionHtml;
//   }
// }

//   let currentPage = 1; // 현재 페이지
//   let pageHtml = ""; // 페이지 HTML 초기화
//   let pages = []; // 각 페이지의 HTML을 저장할 배열

//   if (currentPage === 1) {
//     pageHtml += `
//       <div class="page">
//         <div class="header">
//           <div class="headerLeft">
//             <div class="leftTop">
//               <div style="font-size: 20px;"><span style="color: blue;">기본 </span>중 1-1</div>
//               <div style="font-size: 14px; color: gray; padding-top: 5px">소인수분해</div>
//             </div>
//             <div class="leftBottom">
//               <div style="font-size: 14px;">50문항 | 콘텐츠뱅크</div>
//             </div>
//           </div>
//           <div class="headerRight">
//             <div>이미지 아이콘</div>
//             <div class="inputWrapper">
//               <div style="font-size: 14px;">2024.02.27 이름</div>
//               <input style="border: none; border-bottom: 1px solid gray; margin-left: 5px; font-size: 8px;"></input>
//             </div>
//           </div>
//         </div>`;
//   }

//   pageHtml += '<div class="viewer" style="height: 950px;">';
//   let totalHeight = 0;
//   let questionHeight = 200;
//   let questionsBefore1800 = []; // 1800 이전의 문제를 담을 배열
//   let exceededQuestions = []; // 1800을 초과한 문제를 담을 배열

//   let leftHtml = ""; // 좌측에 표시할 HTML 문자열
//   let rightHtml = ""; // 우측에 표시할 HTML 문자열

//   questions.forEach((question) => {
//     if (totalHeight + questionHeight < 1800) {
//       questionsBefore1800.push(question);
//       console.log(questionsBefore1800);
//       totalHeight += questionHeight; // 높이 추가
//     } else {
//       exceededQuestions.push(question); // 초과한 문제 추가
//     }

//     totalHeight = 0;
//     if (questionsBefore1800) {
//       questionsBefore1800.forEach((question, index) => {
//         const questionHtml = `<div class="left">문제 ${question.id}. ${question.content}</div>`;
//         if (totalHeight + questionHeight >= 800) {
//           rightHtml += `<div class="right">문제 ${question.id}. ${question.content}</div>`;
//         } else {
//           leftHtml += questionHtml;
//         }
//         totalHeight += questionHeight;

//         // 좌측과 우측의 HTML을 합칩니다.
//         if (rightHtml === "") {
//           pageHtml += `<div class="left" style="width: 400px;">${leftHtml}</div>`;
//         } else {
//           pageHtml += `<div class="left">${leftHtml}</div><div class="right">${rightHtml}</div>`;
//         }
//         pageHtml += "</div></div>";
//         // 현재 페이지의 HTML을 배열에 추가합니다.
//         pages.push(pageHtml);
//         questionsBefore1800 = []; // 이전 페이지의 문제들을 비움
//         currentPage++;
//       });
//     }

//     totalHeight = 0;
//     if (exceededQuestions) {
//       exceededQuestions.forEach((question) => {
//         if (totalHeight + questionHeight < 1800) {
//           questionsBefore1800.push(question);
//           totalHeight += questionHeight; // 높이 추가
//         } else {
//           exceededQuestions = []; // 이전 페이지의 문제들을 비움
//           exceededQuestions.push(question); // 초과한 문제 추가
//         }
//       });
//     } else {
//       return;
//     }
//     totalHeight = 0;
//   });

//   const htmlContent = ejs.render(
//     `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <!-- CSS 스타일 적용 -->
//       <style>
//         ${cssStyles}
//       </style>
//     </head>
//     <body>
//       <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
//       <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
//       ${pages.join("")}
//       </body>
//     </html>
//   `,
//     data
//   );
