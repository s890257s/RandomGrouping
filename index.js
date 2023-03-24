//抓取元素
const totalGroups = document.getElementById("totalGroups");
const memberHome = document.getElementById("memberHome");
const assignBTN = document.getElementById("assignBTN");
const clearBTN = document.getElementById("clearBTN");
const groupHome = document.getElementById("groupHome");
const groupCountBTNs = document.getElementById("groupCountBTNs");
const saveDataBTNs = document.getElementsByClassName("savaDataBTNs")[0];
const removeDataBTN = document.getElementById("removeDataBTN");
let finalGroups = []; //最終分組
let isGroupingByRandom = false;
let isExample = true;


//初始化
(function initialize() {
  //填入預設值
  memberHome.innerHTML = "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12";
  totalGroups.value = 4;

  //填入預設的【分組用按鈕】
  let btns = "";
  for (let i = 4; i <= 7; i++) {
    btns += `<button class="groupCountBTN ${i == 4 ? "active" : ""
      }">${i}</button>`;
  }
  groupCountBTNs.innerHTML = btns;

  //讀取並渲染保存的資料
  let t, saveData = (t = localStorage.getItem("saveData")) === null ? [] : JSON.parse(t);
  renderSaveData(saveData);
})();

//分組邏輯(照順序分組 → 打亂每組順序 → 從每組中逐一抓人，丟到最終分組名單)
assignBTN.addEventListener("click", function () {
  let memberArray = memberHome.value.trim().split("\n"); //總成員陣列
  let memberSize = memberArray.length; //總人數
  let tG = +totalGroups.value; //總組數
  let groupOfOrder = []; //第一次分組陣列
  finalGroups = []; //歸零最終分組陣列

  //如果沒有輸入值，終止程式
  if (tG <= 0 || memberArray[0] == "") {
    return;
  }

  //開發中-完全隨機分組
  if (isGroupingByRandom) {
    shuffle(memberArray);

    for (let i = 0; i < memberSize; i += tG) {
      groupOfOrder.push(memberArray.slice(i, i + tG));
    }

  } else {
    //第一次照順序分組
    for (let i = 0; i < memberSize; i += tG) {
      groupOfOrder.push(memberArray.slice(i, i + tG));
    }

    //打亂每組順序
    groupOfOrder.forEach((g) => {
      shuffle(g);
    });

    //逐一從每組中抓人，放到最終分組名單
    for (let i = 0; i < tG; i++) {
      finalGroups.push([]);
      for (let j = 0; j < groupOfOrder.length; j++) {
        finalGroups[i].push(groupOfOrder[j][i]);
      }
    }

  }

  renderPage();
  if (!isExample) {
    saveData();
  }
});

//執行預設方法
assignBTN.click();

//綁定預設分組按鈕事件
Array.from(document.getElementsByClassName("groupCountBTN")).forEach((b) => {
  b.addEventListener("click", function () {
    totalGroups.value = this.innerHTML;
    // 全部變白色
    for (let i = 0; i < this.parentElement.childNodes.length; i++) {
      this.parentElement.childNodes[i].classList.remove("active");
    }
    // 點擊變橘色
    this.classList.add("active");
    assignBTN.click();
  });
});

//Fisher-Yates演算法，打亂Array順序
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//頁面渲染
function renderPage() {

  let outputData = "";
  for (let i = 1; i <= finalGroups.length; i++) {
    outputData += '<div class="groupCard">';
    outputData += `<p>第${i}組</p>`;
    outputData += '<div><textarea cols="30" rows="12">';
    finalGroups[i - 1].forEach((m) => {
      if (m != undefined) {
        outputData += m + "\n";
      }
    });
    outputData += "</textarea></div>";
    outputData += "</div>";
  }
  groupHome.innerHTML = outputData;
}

// 清空分組名單
clearBTN.addEventListener("click", () => {
  Array.from(document.getElementsByTagName("textarea")).forEach(ta => {
    ta.innerHTML = "";
    ta.value = "";
  });
});

//清除所有資料
removeDataBTN.addEventListener("click", function () {
  if (confirm("移除所有歷史分組?")) {
    saveDataBTNs.innerHTML = "";
    localStorage.removeItem("saveData")
  }
})

// 判斷總組數input是否為 4 - 7
totalGroups.addEventListener("input", () => {
  let btns = Array.from(groupCountBTNs.childNodes);
  for (let i = 0; i < btns.length; i++) {
    totalGroups.value == btns[i].innerHTML
      ? btns[i].classList.add("active")
      : btns[i].classList.remove("active");
  }
});

//產生唯一識別UUID
function getUUID() {
  var d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

//切換【示範】狀態
memberHome.addEventListener("change", () => {
  isExample = false;
})

//保存分組資料
function saveData() {

  let t, saveData = (t = localStorage.getItem("saveData")) === null ? [] : JSON.parse(t);

  saveData.push({
    id: getUUID(), groups: finalGroups, originData: memberHome.value
  });

  localStorage.setItem('saveData', JSON.stringify(saveData));

  renderSaveData(saveData);
}

//渲染分組資料按鈕
function renderSaveData(saveData) {
  let outPutBTNs = "";
  saveData.forEach(s => {
    outPutBTNs += `<button class='saveDataBTN' id='${s.id}'>${s.id.slice(0, 6)}</button>`;
  })
  saveDataBTNs.innerHTML = outPutBTNs;
}

//分組資料按鈕的點擊事件
saveDataBTNs.addEventListener('click', function (e) {

  if (e.target.classList.contains("saveDataBTN")) {
    targetGroup = JSON.parse(localStorage.getItem("saveData")).filter(item => item.id == e.target.id)[0]
    finalGroups = targetGroup.groups;
    totalGroups.value = targetGroup.groups.length;
    memberHome.value = targetGroup.originData;
    renderPage();
    totalGroups.dispatchEvent(new CustomEvent("input"));
  }
})