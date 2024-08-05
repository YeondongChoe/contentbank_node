import ejs from 'ejs';
import puppeteer from 'puppeteer';

const CSS_STYLES = `
  @page {
    size: A4;
    margin: 20px 10px 10px 10px;
  }
  body {
    font-family: Consolas, monaco;
  }
  .firstPage, .page {
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
  .inputWrapper, .viewer {
    display: flex;
  }
  .wrapper {
    padding: 20px;
    width: 48%;
  }
  .content, .center {
    display: flex;
  }
  .center {
    justify-content: center;
    flex: 1;
    box-sizing: border-box;
    padding: 20px;
  }
`;

const processQuestions = (content) => {
  return content.map((item) => {
    const questionContent = item.quizItemList.find((quiz) => quiz.type === "QUESTION")?.content || "No question content";
    return { num: item.num, content: questionContent, height: item.height };
  });
};

const generateHeader = (questionCount) => `
  <div class="header">
    <div class="headerLeft">
      <div class="leftTop">
        <div style="font-size: 20px;"><span style="color: blue;"> </span></div>
        <div style="font-size: 14px; color: gray; padding-top: 5px"></div>
      </div>
      <div class="leftBottom">
        <div style="font-size: 14px;">${questionCount}문항</div>
      </div>
    </div>
    <div class="headerRight">
      <div></div>
      <div class="inputWrapper">
        <div style="font-size: 14px;">이름</div>
        <input style="border: none; border-bottom: 1px solid gray; margin-left: 5px; font-size: 8px;">
      </div>
    </div>
  </div>
`;

const generateQuestionHtml = (question) => `
  <div class="content">${question.num}${question.content}</div>
`;

const generatePageHtml = (leftArray, rightArray, currentPage, totalQuestions) => {
  let pageHtml = `<div class="${currentPage === 1 ? 'firstPage' : 'page'}">`;

  if (currentPage === 1) {
    pageHtml += generateHeader(totalQuestions);
  }

  pageHtml += '<div class="viewer">';
  pageHtml += `<div class="wrapper">${leftArray.map(generateQuestionHtml).join('')}</div>`;
  pageHtml += `<div class="wrapper">${rightArray.map(generateQuestionHtml).join('')}</div>`;
  pageHtml += '</div></div>';

  return pageHtml;
};

const generatePagesHtml = (questions) => {
  const pages = [];
  let currentPage = 1;
  let allQuestions = [...questions];

  while (allQuestions.length > 0) {
    let totalHeight = 0;
    const leftArray = [];
    const rightArray = [];

    while (allQuestions.length > 0 && totalHeight <= 1600) {
      const question = allQuestions.shift();
      if (totalHeight + question.height <= 800) {
        leftArray.push(question);
      } else {
        rightArray.push(question);
      }
      totalHeight += question.height;
    }

    pages.push(generatePageHtml(leftArray, rightArray, currentPage, questions.length));
    currentPage++;
  }

  return pages;
};

export async function generatePDF(data) {
  try {
    const questions = processQuestions(data.content);

    const htmlContent = ejs.render(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${CSS_STYLES}</style>
      </head>
      <body>
        <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
        ${generatePagesHtml(questions).join('')}
      </body>
      </html>
    `, data);

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}