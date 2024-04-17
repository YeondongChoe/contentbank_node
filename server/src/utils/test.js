let currentPage = 1; // 현재 페이지
let currentQuestionIndex = 0; // 현재 페이지에서 시작할 문항의 인덱스
let pages = []; // 각 페이지의 HTML을 저장할 배열
let exceededQuestions = []; // 조건을 충족하는 문항을 저장할 배열

while (currentQuestionIndex < questions.length) {
  let pageHtml = ""; // 페이지 HTML 초기화

  // 페이지의 첫 번째에만 헤더를 포함하도록 설정
  if (currentPage === 1) {
    pageHtml += `
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
        </div>`;
  }

  pageHtml += '<div class="viewer" style="height: 950px;">';
  let totalHeight = 0;
  let questionHeight = 100; // 문제의 예상 높이 (예시)

  let leftHtml = ""; // 좌측에 표시할 HTML 문자열
  let rightHtml = ""; // 우측에 표시할 HTML 문자열

  let questionsBefore1800 = []; // 1800 이전의 문제를 담을 배열
  let exceededQuestions = []; // 1800을 초과한 문제를 담을 배열

  // 페이지 내 문제들 처리
  questions.slice(currentQuestionIndex).forEach((question, index) => {
    const questionHtml = `<div class="left">문제 ${question.id}. ${question.content}</div>`;

    //console.log(questionHeight);

    if (totalHeight + questionHeight >= 800) {
      // 우측에 표시
      rightHtml += `<div class="right">문제 ${question.id}. ${question.content}</div>`;
    } else {
      // 좌측에 표시
      leftHtml += questionHtml;
    }
    totalHeight += questionHeight;
    // console.log((totalHeight += questionHeight));

    // 1600 이후의 문항을 exceededQuestions 배열에 추가
    if (totalHeight + questionHeight >= 1800) {
      console.log(question);
      exceededQuestions.push(question);
    }

    if (index === questions.length - 1) {
      // 마지막 문제까지 처리한 경우 다음 페이지로 넘어가지 않음
      currentQuestionIndex += index + 1;
    }
  });

  // 좌측과 우측의 HTML을 합칩니다.
  if (rightHtml === "") {
    pageHtml += `<div class="left" style="width: 400px;">${leftHtml}</div>`;
  } else {
    pageHtml += `<div class="left">${leftHtml}</div><div class="right">${rightHtml}</div>`;
  }
  pageHtml += "</div></div>";
  // 현재 페이지의 HTML을 배열에 추가합니다.
  pages.push(pageHtml);
  currentPage++;
  if (0 < exceededQuestions.length) {
    pageHtml = '<div class="page"><div class="viewer" style="height: 1100px;">';
    totalHeight = 0; // 높이 초기화
    leftHtml = ""; // 좌측 HTML 초기화
    rightHtml = ""; // 우측 HTML 초기화
    exceededQuestions.forEach((question, index) => {
      const questionHtml = `<div class="left">문제 ${question.id}. ${question.content}</div>`;
      //console.log(questionHtml);
      let questionHeight = 100; // 문제의 예상 높이 (예시)
      if (totalHeight + questionHeight >= 800) {
        // 우측에 표시
        //rightHtml += `<div class="right">문제 ${question.id}. ${question.content}</div>`;
      } else {
        // 좌측에 표시
        //leftHtml += questionHtml;
      }
      totalHeight += questionHeight;
      //console.log(totalHeight + questionHeight);

      // 1600 이후의 문항을 exceededQuestions 배열에 추가
      if (totalHeight + questionHeight >= 1600) {
        exceededQuestions = [];
        exceededQuestions.push(question);
      }
      if (index === questions.length - 1) {
        // 마지막 문제까지 처리한 경우 다음 페이지로 넘어가지 않음
        currentQuestionIndex += index + 1;
      }
    });
    if (rightHtml === "") {
      //pageHtml += `<div class="left" style="width: 400px;">${leftHtml}</div>`;
    } else {
      //pageHtml += `<div class="left">${leftHtml}</div><div class="right">${rightHtml}</div>`;
    }
    pageHtml += "</div></div>";

    // 현재 페이지의 HTML을 배열에 추가합니다.
    pages.push(pageHtml);
    //console.log(pageHtml);
    currentPage++;
  }
}
