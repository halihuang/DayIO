import {returnCourses} from "./classroom.js";

const fs = require('fs');

export function loadAssignmentForm() {
  document.getElementById("assignmentsForm").style.display = "block";
  document.getElementById("meetingsForm").style.display = "none";
}

export function loadMeetingForm() {
  document.getElementById("assignmentsForm").style.display = "none";
  document.getElementById("meetingsForm").style.display = "block";
}

export async function loadCourses() {
  let courses = await Promise.resolve(returnCourses());
  console.log(courses);
  let coursesHTML = "Course:";

  for (let i = 0; i < courses.courses.length; i++)
  {
    coursesHTML += '<div class="form-check"><input class="form-check-input" type="radio" name="availableCourses" id="' + courses.courses[i].name + '" value="' + courses.courses[i].name +
    '"><label class="form-check-label" for="' + courses.courses[i].name + '">' + courses.courses[i].name + '</label></div>'
  }

  console.log(coursesHTML);

  document.getElementById("assignmentCourseRadios").innerHTML = coursesHTML;
  document.getElementById("meetingCourseRadios").innerHTML = coursesHTML;
}

export async function assignmentSubmit() {
  let file = await Promise.resolve(returnAssignments());

  let assignment = {
    courseName: $('input[name=availableCourses]:checked').val(),
    courseWorkId: Math.floor(Math.random() * (99999999999 - 10000000000 + 1)) + 10000000000,
    title: $('input[name=assignmentTitle]').val(),
    dueDate: {
      year: $('input[name=assignmentDateSelector]').val().substring(6, 10),
      month: $('input[name=assignmentDateSelector]').val().substring(0, 2),
      day: $('input[name=assignmentDateSelector]').val().substring(3, 5)
    },
    dueTime: $('input[name=assignmentTimeNotes]').val(),
    materials: $('input[name=assignmentNotes]').val(),
  };



  fs.writeFile('customAssignments.json', JSON.stringify(file).concat(JSON.stringify(assignment)), (err) => {//whatever u wanna do after finishing writing
  })
}

export async function meetingSubmit() {
  let file = await Promise.resolve(returnMeetings());

  let meeting = {
    courseName: $('input[name=availableCourses]:checked').val(),
    courseWorkId: Math.floor(Math.random() * (99999999999 - 10000000000 + 1)) + 10000000000,
    title: $('input[name=meetingTitle]').val(),
    date: {
      year: $('input[name=meetingDateSelector]').val().substring(6, 10),
      month: $('input[name=meetingDateSelector]').val().substring(0, 2),
      day: $('input[name=meetingDateSelector]').val().substring(3, 5)
    },
    time: $('input[name=meetingTimeNotes]').val(),
    notes: $('input[name=meetingNotes]').val(),
    link: $('input[name=meetingLink]').val(),
  };



  fs.writeFile('customMeetings.json', JSON.stringify(file).concat(JSON.stringify(meeting)), (err) => {//whatever u wanna do after finishing writing
  })
}

export async function returnAssignments(){
  return new Promise((resolve, reject) => {
    fs.readFile('customAssignments.json', (err, content) =>{
      if(err){
        reject(console.log("error occured reading assignments", err));
      }
      let assignments = JSON.parse(content);
      resolve(assignments);
    });
  });
}

export async function returnMeetings(){
  return new Promise((resolve, reject) => {
    fs.readFile('customMeetings.json', (err, content) =>{
      if(err){
        reject(console.log("error occured reading meetings", err));
      }
      let assignments = JSON.parse(content);
      resolve(assignments);
    });
  });
}
