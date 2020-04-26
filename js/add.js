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

  // console.log(coursesHTML);

  document.getElementById("assignmentCourseRadios").innerHTML = coursesHTML;
  document.getElementById("meetingCourseRadios").innerHTML = coursesHTML;
}

export function assignmentSubmit() {
  let assignments
  fs.readFile('customAssignments.json', (err,res) => {
    if(err){
      console.log(err);
    }
    else{
      assignments= JSON.parse(res);
    }
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
      materials: $('input[name=assignmentNotes]').val(),
    };
    if(!assignments){
      console.log("reset")
      assignments = [];
    }

    // console.log("pushed assignment",assignment);
    assignments.push(assignment);
    // console.log("written file", assignments);

    fs.writeFile('customAssignments.json', JSON.stringify(assignments), (err) => {
      //whatever u wanna do after finishing writing
    })
  });
}

export async function meetingSubmit() {
  fs.readFile('customMeetings.json', (err,res)=>{
    let meetings;
    if(err){
      console.log(err);
    }
    else{
      meetings = JSON.parse(res);
    }
    let meeting = {
      courseName: $('input[name=availableCourses]:checked').val(),
      courseWorkId: Math.floor(Math.random() * (99999999999 - 10000000000 + 1)) + 10000000000,
      title: $('input[name=meetingTitle]').val(),
      dueDate: {
        year: parseInt($('input[name=meetingDateSelector]').val().substring(6, 10)),
        month: parseInt($('input[name=meetingDateSelector]').val().substring(0, 2)),
        day: parseInt($('input[name=meetingDateSelector]').val().substring(3, 5))
      },
      dueTime: createTimeObject($('input[name=meetingTimeNotes]').val()),
      notes: $('input[name=meetingNotes]').val(),
      link: $('input[name=meetingLink]').val(),
    };
    if(!meetings){
      meetings = [];
    }
    meetings.push(meeting);
    fs.writeFile('customMeetings.json', JSON.stringify(meetings), (err) => {
      if(err){
        console.log('couldnt read', err);
      }//whatever u wanna do after finishing writing
    })

  })
}

function createTimeObject(timeStr){
  console.log(timeStr.substring(timeStr.length - 2));
  let time = {}
  if(timeStr.indexOf(':') == 1){
    time.hours = parseInt(timeStr.charAt(0));
    time.minutes = parseInt(timeStr.substring(2,4));

  }
  else{
    time.hours = parseInt(timeStr.substring(0,2));
    time.minutes = parseInt(timeStr.substring(3,5));
  }
  if(timeStr.substring(timeStr.length - 2) == 'PM'){
    time.hours += 12;
  }
  return time;
}


function returnAssignments(){
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

function returnMeetings(){
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
