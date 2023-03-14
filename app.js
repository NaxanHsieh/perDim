//array - 今年每個月開始的天數
let thisMonthStartDay = [];
//array - 今年每個月的天數
let thisDaysInMonth;
// array - 去年每個月開始的天數
let lastMonthStartDay = [];
// array - 去年每個月天數
let lastDaysInMonth;

//c 為所選年份 calendar JSON資料 （網路資料）;support #year change
let c;

//below support #month change
//所選年份的日曆
// let monthCalendar = [];
//所選月份(該年)總共幾天
let daysInMonth;
//所選月份(該年)開始天數
let monthStartDay;

document.addEventListener("DOMContentLoaded", () => {
  //載入今年及去年下拉選單並且計算每個月從該年第幾天開始
  let todayDate = new Date();
  let thisYear = todayDate.getFullYear();
  for (let i = 1; i >= 0; i--) {
    let y = document.createElement("option");
    y.setAttribute("value", thisYear - i);
    y.innerHTML = thisYear - i;
    document.querySelector("#year").appendChild(y);
    // 計算該月份開始是該年第幾日開始
    let monthCounter = 1;
    if (thisYear - i == thisYear) {
      thisDaysInMonth = [
        31,
        ((thisYear - i) % 4 === 0 && (thisYear - i) % 100 !== 0) ||
        (thisYear - i) % 400 === 0
          ? 29
          : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];
      for (let j = 0; j < 12; j++) {
        thisMonthStartDay.push(monthCounter);
        monthCounter = monthCounter + thisDaysInMonth[j];
      }
    } else {
      lastDaysInMonth = [
        31,
        ((thisYear - i) % 4 === 0 && (thisYear - i) % 100 !== 0) ||
        (thisYear - i) % 400 === 0
          ? 29
          : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];
      for (let j = 0; j < 12; j++) {
        lastMonthStartDay.push(monthCounter);
        monthCounter = monthCounter + lastDaysInMonth[j];
      }
    }
  }

  //載入1到12月的下拉選單選項
  for (let i = 1; i <= 12; i++) {
    let m = document.createElement("option");
    m.setAttribute("value", i);
    m.innerText = i;
    document.querySelector("#month").appendChild(m);
  }
});

//query選擇年份的日曆

document.querySelector("#year").addEventListener("change", () => {
  //取得該選取年的台灣含國定假期日曆 (c)
  let y = document.querySelector("#year").value;
  fetch(`https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${y}.json`)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      c = result;
    })
    .catch((error) => {
      console.log(`Error: ${error}`);
    });
  //導入選擇年的日曆
  let todayDate = new Date();
  let thisYear = todayDate.getFullYear();
  if (thisYear == Number(y)) {
    daysInMonth = thisDaysInMonth;
    monthStartDay = thisMonthStartDay;
  } else {
    daysInMonth = lastDaysInMonth;
    monthStartDay = lastMonthStartDay;
  }

  //修改年份後清除月份 （讓month change function才可以重新執行)
  if (document.querySelector("#month").value != "non") {
    document.querySelector("#month").value = "non";
  }
});

document.querySelector(".dateQuery").addEventListener("click", (event) => {
  event.preventDefault();

  //如果有先前的表格，移除先前的表格
  if (document.querySelector(".display").childElementCount) {
    document.querySelector(".display").innerHTML = "";
  }

  let m = document.querySelector("#month").value;
  //所選月份的array資料
  let monthCalendar = [];
  //loop 該月開始日 到 該月開始日+該月天數; [m -1]該月開始日為array, 從0開始，所以減一
  for (
    let i = monthStartDay[m - 1];
    i < monthStartDay[m - 1] + daysInMonth[m - 1];
    i++
  ) {
    monthCalendar.push(c[i - 1]);
  }

  //產生年月及表頭
  let display = document.querySelector(".display");
  let head = document.createElement("h2");
  head.innerHTML = `${
    document.querySelector("#year").value
  }年${m}月 出差津貼表`;
  display.appendChild(head);
  let tableHeader = document.createElement("table");
  tableHeader.innerHTML = `<tr class="tableHeader"><th id="tableDate">日期</th><th id="tableWeek">星期</th><th id="tableHoliday">假期別</th><th id="tableSite">出差地點</th><th id="tableHour">津貼時數</th><th id="tableParking">停車費</th><th id="tableIcon"></th><th>原因說明</th></tr>`;
  display.appendChild(tableHeader);
  //跑出該月份列表
  for (let i = 0; i < monthCalendar.length; i++) {
    //日期
    let date = monthCalendar[i].date.substring(4, 8);
    //星期別
    let week = monthCalendar[i].week;
    //是否為假日
    let isHoliday;
    if (monthCalendar[i].isHoliday) {
      isHoliday = "holiday";
    } else {
      isHoliday = "nonHoliday";
    }
    //假期別
    let holiday;
    if (monthCalendar[i].description) {
      holiday = monthCalendar[i].description;
    } else if (monthCalendar[i].week == "六" || monthCalendar[i].week == "日") {
      holiday = "週末";
    } else {
      holiday = "平日";
    }
    //parking 欄位產生function
    function parkingHTML(n) {
      let result = "";
      for (let i = 1; i < n + 1; i++) {
        let item = `<input
        type="number"
        min="0"
        class="parkingfee"
        placeholder="${date}-${i}"
      />`;
        result = result + item;
      }
      return result;
    }
    //perDiem 平假日判斷
    let pd = "";
    if (isHoliday == "holiday") {
      pd = `<option class="perDimOption" value="" default></option>
              <option class="perDimOption" value="1">1天</option>`;
    } else {
      pd = `<option class="perDimOption" value="" default></option>
        <option class="perDimOption" value="0.5">0.5天</option>
        <option class="perDimOption" value="1">1天</option>`;
    }

    //產生HTML列表
    let tr = document.createElement("tr");
    tr.setAttribute("class", "nonHoliday");

    tr.innerHTML = `<td class="tableDate ${isHoliday}">${date}</td>
                    <td class="tableWeek ${isHoliday}">${week}</td>
                    <td class="tableHoliday ${isHoliday}">${holiday}</td>
                    <td class="tableSite">
                        <input
                            type="text"
                            class="tableSiteInput"
                            placeholder="輸入出差地點"
                        />
                    </td>
                    <td class="tablePerDim">
                    <select class="perDim" id="perDim1">
                        ${pd};
                    </select>
                    </td> 
                    <td class="tableParking" id="parkingFeeRow${i}">
                      <span class="pkSpan">
                        <span class="pkSerial"></span><input type="number" min="0" class="parkingfee" placeholder="停車費"/>
                      </span>
                    </td>
                    <td class="">
                      <img id="add${i}" class="icon" src="./images/plus.png" alt="add" />
                      <img id="delete${i}" class="icon" src="./images/delete.png" alt="delete" />
                    </td>
                    <td>
                        <input class="reason" type="text" placeholder="原因說明"/>
                    </td>`;

    //假日row變色（配合CSS .isHoliday)
    if (isHoliday == "holiday") {
      tr.setAttribute("class", "isHoliday");
    }
    document.querySelector("table").appendChild(tr);
    //新增按鈕增加parking fee 欄位
    document.querySelector(`#add${i}`).addEventListener("click", () => {
      // if (document.querySelector(`#add${i}`).parentElement.previousElementSibling.childElementCount == 0)
      let pi = document.querySelector(`#add${i}`).parentElement
        .previousElementSibling;
      //如果只有一格或者前一格沒有輸入數字，則不允許新增
      if (
        pi.children.length > 0 &&
        ((pi.children.length = 1 && pi.children[0].children[1].value == "") ||
          pi.children[pi.children.length - 1].children[1].value == "")
      ) {
        //emptyAlert為黃色背景提醒（see CSS)
        pi.children[pi.children.length - 1].children[1].setAttribute(
          "class",
          "parkingfee emptyAlert"
        );
        setTimeout(() => {
          pi.children[pi.children.length - 1].children[1].setAttribute(
            "class",
            "parkingfee"
          );
        }, 2000);
      } else {
        let s = document.createElement("span");
        s.setAttribute("class", "pkSpan");

        let sp = document.createElement("span");
        sp.setAttribute("class", "pkSerial");
        let p = document.createElement("input");
        p.setAttribute("type", "number");
        p.setAttribute("min", "0");
        p.setAttribute("class", "parkingfee");
        p.setAttribute("placeholder", "停車費");

        s.appendChild(sp);
        s.appendChild(p);
        document.querySelector(`#parkingFeeRow${i}`).appendChild(s);
      }
    });

    //刪除按鈕刪除paking fee欄位
    document.querySelector(`#delete${i}`).addEventListener("click", () => {
      let db = document.querySelector(`#delete${i}`).parentElement
        .previousElementSibling;
      if (db.children.length > 0) {
        db.children[db.children.length - 1].remove();
      }
    });
  }

  //清除年及月的選擇，以利下次重新query
  document.querySelector("#year").value = "non";
  document.querySelector("#month").value = "non";

  //產生小計列
  //平日小計
  let workdaySum = document.createElement("tr");
  workdaySum.setAttribute("style", "border-top: 2px solid black;");
  workdaySum.setAttribute("class", "sumTr");
  workdaySum.innerHTML = `<td colspan="5" class="sumTitle">平日天數: <span id="wdDay" class="sumDay">--</span> 天</td>
                        <td class="sumAmount">x 180 = <span id="wdSum" class="sumTotal">--</span> 元</td>`;
  document.querySelector("table").appendChild(workdaySum);
  //假日小計
  let holidaySum = document.createElement("tr");
  holidaySum.setAttribute("class", "sumTr");
  holidaySum.innerHTML = `<td colspan="5" class="sumTitle">假日天數: <span id="hdDay" class="sumDay">--</span> 天</td>
                        <td class="sumAmount">x 380 = <span id="hdSum" class="sumTotal" style="padding-left: 0.6vw">--</span> 元</td>`;
  document.querySelector("table").appendChild(holidaySum);
  //停車費小計
  let parkingSum = document.createElement("tr");
  parkingSum.setAttribute("class", "sumTr");
  parkingSum.innerHTML = `<td colspan="5" class="sumTitle" style="padding-right: 5.8vw;">停車小計: </td>
                        <td class="sumAmount" style="padding-left: 5.4vw;"> = <span id="pkSum" class="sumTotal">--</span> 元</td>`;
  document.querySelector("table").appendChild(parkingSum);
  //總金額
  let totalSum = document.createElement("tr");
  totalSum.setAttribute("class", "sumTr");
  totalSum.setAttribute("style", "border-bottom: 2px solid black");
  totalSum.innerHTML = `<td colspan="6" class="totalAmount">總金額:<span id="totalPayment">--</span> 元</td>`;
  document.querySelector("table").appendChild(totalSum);
  // let calButton = document.createElement("button");
  // calButton.innerHTML = "計算金額";
  // document.querySelector(".display").appendChild(calButton);

  //生成計算按鈕
  let buttonDiv = document.createElement("div");
  buttonDiv.setAttribute("class", "calButton");
  buttonDiv.innerHTML =
    '<button id="calButton" class="btn btn-primary me-4">計算金額</button><button id="printButton" class="btn btn-success me-1" hidden>列印表格</button><button id="downloadButton" class="btn btn-success me-1" hidden>下載表格</button>';
  document.querySelector(".display").appendChild(buttonDiv);

  //計算價錢天數按鈕
  document.querySelector("#calButton").addEventListener("click", () => {
    //檢查是否有填寫出差地點及出差原因
    let validate;
    //檢查是否有寫出差地
    document.querySelectorAll(".perDim").forEach((i) => {
      //有填寫出差天數（津貼時數）
      let perDim = i.value != "" ? true : false;
      //出差地點值
      let noLocation =
        i.parentElement.previousElementSibling.children[0].value == ""
          ? true
          : false;
      //是否為假日值
      let isHoliday =
        i.parentElement.parentElement.className == "isHoliday" ? true : false;
      //reason值
      let noReason =
        i.parentElement.parentElement.children[7].children[0].value == ""
          ? true
          : false;

      if (perDim) {
        i.parentElement.previousElementSibling.children[0].classList.remove(
          "reasonEmp"
        );
        i.parentElement.parentElement.children[7].children[0].classList.remove(
          "reasonEmp"
        );
        validate = true;
        if (noLocation) {
          //無地點標記（出差地點空白）
          i.parentElement.previousElementSibling.children[0].classList.add(
            "reasonEmp"
          );
          validate = false;
        }
        if (isHoliday && noReason) {
          //假日出差標記 （假日原因空白）
          i.parentElement.parentElement.children[7].children[0].classList.add(
            "reasonEmp"
          );
          validate = false;
        }
      }
    });

    //計算金額 (validation過才會計算金額)
    if (validate) {
      let hd = 0;
      let nhd = 0;
      document.querySelectorAll(".perDim").forEach((i) => {
        //計算假日及平日天數及金額
        if (i.parentElement.parentElement.className == "isHoliday") {
          hd = hd + Number(i.value);
        } else if (i.parentElement.parentElement.className == "nonHoliday") {
          nhd = nhd + Number(i.value);
        }
      });
      let hdPayment = hd * 380;
      let nhdPayment = nhd * 180;
      document.querySelector("#wdDay").innerText = nhd.toFixed(1);
      document.querySelector("#wdSum").innerText = nhdPayment;
      document.querySelector("#hdDay").innerText = hd.toFixed(1);
      document.querySelector("#hdSum").innerText = hdPayment;

      //計算停車費
      let pNCount = 1;
      let pkPayment = 0;
      document.querySelectorAll(".parkingfee").forEach((i) => {
        //給序號

        if (!i.value) {
          //如果是parking fee是空白則刪除
          i.parentElement.remove();
        } else {
          i.previousElementSibling.innerText = pNCount
            .toString()
            //讓序號保持兩位數
            .padStart(2, "0");
          pNCount += 1;
          //計算金額
          pkPayment += Number(i.value);
        }
      });
      document.querySelector("#pkSum").innerText = pkPayment;
      //計算總金額
      let totalPayment = hdPayment + nhdPayment + pkPayment;
      document.querySelector("#totalPayment").innerText = totalPayment;
    }
  });
});
