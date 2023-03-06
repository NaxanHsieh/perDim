let c;
document.addEventListener("DOMContentLoaded", () => {
  //載入1到12月的下拉選單選項
  for (let i = 1; i <= 12; i++) {
    let m = document.createElement("option");
    m.setAttribute("value", i);
    m.innerText = i + "月";
    document.querySelector("#month").appendChild(m);
  }
});
//query選擇年份的日曆
document.querySelector("#year").addEventListener("change", () => {
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
});
