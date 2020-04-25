import {setMonth, setYear, fillCalendar} from "./calendarFiller.js";

export function monthPicker(){
  var date_input=$('input[name="month"]'); //our date input has the name "date"
  var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
  var options={
    format: 'mm/yyyy',
    container: container,
    startView: "months",
    minViewMode: "months",
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options);
  document.getElementById("errorMessage").style.visibility = "hidden";
}

export function datePicker(){
  var date_input=$('input[id="date"]'); //our date input has the name "date"
  var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
  var options={
    format: 'mm/dd/yyyy',
    container: container,
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options);
  document.getElementById("errorMessage").style.visibility = "hidden";
}

export function goToDate(){
  if (document.getElementById("monthSelector").value == "") {
    document.getElementById("errorMessage").style.visibility = "visible";
  } else {
    setMonth(document.getElementById("monthSelector").value.substring(0, 2) - 1);
    setYear(document.getElementById("monthSelector").value.substring(3, 7));
    fillCalendar();
    document.getElementById("errorMessage").style.visibility = "hidden";
  }
}
