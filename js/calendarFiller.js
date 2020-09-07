import {mergeAssignments} from "./classroom.js";

let date = new Date();
let year = date.getFullYear()
let month = date.getMonth()


window.date = date;

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

export function setMonth(newMonth) {
  month = newMonth;
}

export function setYear(newYear) {
  year = newYear;
}

export async function fillCalendar() {
  let firstDay = (new Date(year, month, 1)).getDay();
  let lastDay = (new Date(year, month + 1, 0)).getDate();
  let today = (new Date).getDate();

  let assignments = mergeAssignments();


  if (firstDay == 0) {
    firstDay = 7;
  }

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

      let assignmentsString = "";
      let meetingString = "";

      for (let k = 0; k < assignments.due.length; k++) {
        if (assignments.due[k].dueDate.month == month + 1 && assignments.due[k].dueDate.year == year && assignments.due[k].dueDate.day == date) {
          assignmentsString += '<div class="alert alert-warning small" role="alert">' + assignments.due[k].title + '</div>';
        }
      }

      for (let k = 0; k < assignments.pastDue.length; k++) {
        if (assignments.pastDue[k].dueDate.month == month + 1 && assignments.pastDue[k].dueDate.year == year && assignments.pastDue[k].dueDate.day == date) {
          assignmentsString += '<div class="alert alert-secondary small" role="alert">' + assignments.pastDue[k].title + '</div>';
        }
      }

      if(firstRow && j < firstDay - 1) {
        document.getElementById(col).innerHTML = "";
      } else if (date > lastDay) {
        document.getElementById(col).innerHTML = "";
      } else {
        document.getElementById(col).innerHTML = date + assignmentsString;
        rowUsed++;
      }

      if(date == today) {
        document.getElementById(col).style.backgroundColor = "#007bff";
      } else {
        document.getElementById(col).style.backgroundColor = "#343a40";
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
