const generatePages = (questions) => {
  let currentPage = 1;
  let currentQuestionIndex = 0;
  const pages = [];
  let exceededQuestions = [];

  const generateHeader = () => `
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
            <input style="border: none; border-bottom: 1px solid gray; margin-left: 5px; font-size: 8px;">
          </div>
        </div>
      </div>`;

  const generateQuestionHtml = (question, side) =>
      `<div class="${side}">문제 ${question.id}. ${question.content}</div>`;

  while (currentQuestionIndex < questions.length) {
    let pageHtml = currentPage === 1 ? generateHeader() : '<div class="page">';
    pageHtml += '<div class="viewer" style="height: 950px;">';

    let totalHeight = 0;
    const questionHeight = 100; // Assuming fixed height for each question

    let leftHtml = "";
    let rightHtml = "";

    const remainingQuestions = questions.slice(currentQuestionIndex);

    remainingQuestions.forEach((question, index) => {
      if (totalHeight + questionHeight >= 800) {
        rightHtml += generateQuestionHtml(question, 'right');
      } else {
        leftHtml += generateQuestionHtml(question, 'left');
      }

      totalHeight += questionHeight;

      if (totalHeight + questionHeight >= 1800) {
        exceededQuestions.push(question);
      }

      if (index === remainingQuestions.length - 1) {
        currentQuestionIndex += index + 1;
      }
    });

    pageHtml += rightHtml
        ? `<div class="left">${leftHtml}</div><div class="right">${rightHtml}</div>`
        : `<div class="left" style="width: 400px;">${leftHtml}</div>`;

    pageHtml += "</div></div>";
    pages.push(pageHtml);
    currentPage++;

    if (exceededQuestions.length > 0) {
      pageHtml = '<div class="page"><div class="viewer" style="height: 1100px;">';
      totalHeight = 0;
      leftHtml = "";
      rightHtml = "";

      exceededQuestions.forEach((question, index) => {
        const questionHtml = generateQuestionHtml(question, 'left');

        if (totalHeight + questionHeight < 800) {
          leftHtml += questionHtml;
        }

        totalHeight += questionHeight;

        if (totalHeight + questionHeight >= 1600) {
          exceededQuestions = [question];
        }

        if (index === exceededQuestions.length - 1) {
          currentQuestionIndex += index + 1;
        }
      });

      pageHtml += `<div class="left" style="width: 400px;">${leftHtml}</div>`;
      pageHtml += "</div></div>";
      pages.push(pageHtml);
      currentPage++;
    }
  }

  return pages;
};

export default generatePages;