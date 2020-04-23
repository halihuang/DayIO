let date = new Date();
let year = date.getFullYear()
let month = date.getMonth()

let months = new Array();
months[0] = "January";
months[1] = "February";
months[2] = "March";
months[3] = "April";
months[4] = "May";
months[5] = "June";
months[6] = "July";
months[7] = "August";
months[8] = "September";
months[9] = "October";
months[10] = "November";
months[11] = "December";

export function next() {
  month += 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }
  fillCalendar();
}

export function back() {
  month -= 1;
  if (month < 0) {
    month = 11;
    year -= 1;
  }
  fillCalendar();
}

export function fillCalendar() {
  let firstDay = (new Date(year, month, 1)).getDay();
  let lastDay = (new Date(year, month + 1, 0)).getDate();

  document.getElementById("month").innerHTML = months[month] + " " + year;

  let firstRow = true;
  let rowUsed = 0;
  for (let i = 0; i < 6; i++)
  {
    let row = "row" + (i + 1);
    rowUsed = 0;
    for (let j = 0; j < 7; j++) {
      let col = "slot" + ((i * 7) + j + 1);
      let date = ((i * 7) + j + 2 - firstDay);

      if(firstRow && j < firstDay - 1) {
        document.getElementById(col).innerHTML = "";
      } else if (date > lastDay) {
        document.getElementById(col).innerHTML = "";
      } else {
        document.getElementById(col).innerHTML = date;
        rowUsed++;
      }
    }

    if (rowUsed === 0) {
      document.getElementById(row).style.visibility = "collapse";
    } else {
      document.getElementById(row).style.visibility = "visible";
    }

    firstRow = false;
  }
}
