import {returnCourses, returnCustomAssignments, returnCustomMeetings, removeAssignment, removeMeeting} from "./classroom.js";
import {getMoment} from "./sorting_utils.js"

// const fs = require('fs');
var edited = {
  toEdit: false,
  editObj: ""
}

export function loadAssignmentForm() {
  document.getElementById("assignmentsForm").style.display = "block";
  document.getElementById("meetingsForm").style.display = "none";
}

export function loadMeetingForm() {
  document.getElementById("assignmentsForm").style.display = "none";
  document.getElementById("meetingsForm").style.display = "block";
}

export async function loadCourses() {
  let courses = returnCourses();
  let coursesHTML = "Course:";

  for (let i = 0; i < courses.length; i++)
  {
    coursesHTML += '<div class="form-check"><input class="form-check-input" type="radio" name="availableCourses" id="' + courses[i].name + '" value="' + courses[i].name +
    '"><label class="form-check-label" for="' + courses[i].name + '">' + courses[i].name + '</label></div>'
  }

  // console.log(coursesHTML);

  document.getElementById("assignmentCourseRadios").innerHTML = coursesHTML;
  document.getElementById("meetingCourseRadios").innerHTML = coursesHTML;
}

export function assignmentSubmit() {
  // console.log("parsed", assignments);
  let assignment = {
    courseName: $('input[name=availableCourses]:checked').val(),
    courseWorkId: Math.floor(Math.random() * (99999999999 - 10000000000 + 1)) + 10000000000,
    title: $('input[name=assignmentTitle]').val(),
    dueDate: {
      year: parseInt($('input[name=assignmentDateSelector]').val().substring(6, 10)),
      month: parseInt($('input[name=assignmentDateSelector]').val().substring(0, 2)),
      day: parseInt($('input[name=assignmentDateSelector]').val().substring(3, 5))
    },
    dueTime: createTimeObject($('input[name=assignmentTimeNotes]').val()),
    description: $('input[name=assignmentNotes]').val(),
  };

  if(edited.toEdit){
    console.log("editing")
    removeAssignment(edited.editObj)
  }
  var assignments = returnCustomAssignments();
  // console.log(assignments)
  if(!assignments){
    console.log("reset")
    assignments = [];
  }
  assignments.push(assignment);
  localStorage.setItem('customAssignments', JSON.stringify(assignments));
  if(edited.toEdit){
    edited.toEdit = false;
    window.assignmentsPage.loadAssignments();
  }
}

export function meetingSubmit() {
    let meeting = {
      courseName: $('input[name=availableCourses]:checked').val(),
      courseWorkId: Math.floor(Math.random() * (99999999999 - 10000000000 + 1)) + 10000000000,
      title: $('input[name=meetingTitle]').val(),
      weekday: parseInt($('#weekdays').selectedIndexes()[0]),
      dueTime: createTimeObject($('input[name=meetingTimeNotes]').val()),
      notes: $('input[name=meetingNotes]').val(),
      link: $('input[name=meetingLink]').val(),
    };
    if(edited.toEdit){
      removeMeeting(edited.editObj)
    }
    var meetings = returnCustomMeetings();
    if(!meetings){
      meetings = [];
    }
    meetings.push(meeting);
    localStorage.setItem('customMeetings', JSON.stringify(meetings));
    if(edited.toEdit){
      edited.toEdit = false;
      window.meetingsPage.loadMeetings();
    }
}

export function editAssignment(assignment){
  var time = moment(assignment.dueTime).format("LT").replace(" ", "")
  var date = getMoment(assignment).format("L");
  $("#assignmentCourseRadios").find('input[name=availableCourses]').filter('[value=' + assignment.courseName +']').prop("checked", true)
  $('input[name=assignmentTitle]').val(assignment.title)
  $('input[name=assignmentDateSelector]').val(date)
  $('input[name=assignmentTimeNotes]').val(time)
  $('input[name=assignmentNotes]').val(assignment.description)
  loadAssignmentForm();
  edited.toEdit = true;
  edited.editObj = assignment;
}

export function editMeeting(meeting){
  var time = getMoment(meeting).format("LT").replace(" ", "")
  $("#meetingCourseRadios").find('input[name=availableCourses]').filter('[value=' + meeting.courseName +']').prop("checked", true)
  $('input[name=meetingTitle]').val(meeting.title)
  $('li[data-day=' + meeting.weekday + ']').addClass("weekday-selected")
  $('input[name=meetingTimeNotes]').val(time)
  $('input[name=meetingNotes]').val(meeting.notes)
  $('input[name=meetingLink]').val(meeting.link)
  loadMeetingForm();
  edited.toEdit = true;  
  edited.editObj = meeting;
}

function createTimeObject(timeStr){
  // console.log(timeStr.substring(timeStr.length - 2));
  let time = {}
  if(timeStr.indexOf(':') == 1){
    time.hours = parseInt(timeStr.charAt(0));
    time.minutes = parseInt(timeStr.substring(2,4));

  }
  else{
    time.hours = parseInt(timeStr.substring(0,2));
    time.minutes = parseInt(timeStr.substring(3,5));
  }
  if(timeStr.substring(timeStr.length - 2) == 'pm'){
    time.hours += 12;
  }
  // console.log(time)
  return time;
}



