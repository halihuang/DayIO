import {sortDueDates} from "./sorting_utils.js"

const SCOPES = "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.announcements.readonly";
var CLIENT_ID = "758516973815-0vsh34nl27ga3ig82g02fmffrjdenbgp.apps.googleusercontent.com";
var API_KEY = "AIzaSyDPlWDf4fvnzPBOyV2Fn_aQA84VD3fkO_o";
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest"]
var classroom;
var authorizeButton;
var signoutButton;


$("document").ready(() => {
  gapi.load('client:auth2', initClient);
  // console.log("gapi client open")
})

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    console.log("listening for signin")
    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    setButtons();
  }, function(error) {
      console.log("error initializing gapi client", error)
  });
}


function setButtons(){
  authorizeButton = $('#authorize_button');
  signoutButton = $('#signout_button');
  authorizeButton.click(() => {
    gapi.auth2.getAuthInstance().signIn();
    console.log("signin")
  });

  signoutButton.click(() => {
    updateSigninStatus(false);
    gapi.auth2.getAuthInstance().signOut();
    console.log("signout")
  });
}




function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    document.getElementById("authorize_button").style.display = 'none';
    document.getElementById("signout_button").style.display = 'block';
    refreshClassroom();
  } else {
    document.getElementById("authorize_button").style.display = 'block';
    document.getElementById("signout_button").style.display = 'none';
  }
  window.signedIn = isSignedIn;
}


  async function refreshClassroom() {
    console.log("getting courses")
    classroom = gapi.client.classroom;
    var courses = await getCourses();
    if (courses && courses.length) {
      await getCourseInfo(courses);
    }
    else {
      console.log('No courses found.');
    }

    let x = 300;  // 5 minutes

    // if signed in refresh every 5 minutes;
    // if(gapi.auth2.getAuthInstance().isSignedIn.get()){
    //   setTimeout(refreshClassroom, x*1000);
    // }
  }

  async function getCourses(){
    var res = await classroom.courses.list({
      pageSize: 20,
    })
    var courses = res.result.courses;
    courses = courses.filter((course) => {
      if(course.courseState == "ARCHIVED"){
        return false;
      }
      return true;
    })
    return courses;
  }

  // organizes classroom assignments by date and saves them in a json
  async function getCourseInfo(courses){
    localStorage.setItem('courses', JSON.stringify(courses));
    var assignments = await getAssignments(courses)
    localStorage.setItem('classAssignments', JSON.stringify(assignments));
    var meetings = await getMeetings(courses)
    localStorage.setItem('classMeetings', JSON.stringify(meetings));
    console.log("got course info")
  }

  async function getMeetings(courses){
    var meetings = [];
    for(var course of courses){
      var res = await classroom.courses.announcements.list({
        courseId: course.id,
        pageSize:10,
      })
      let announcements = res.result.announcements;
      for(let announcement of announcements){
        if(announcement.text.includes('.zoom.') || announcement.text.includes('meet.google.com')){
          // console.log(announcement.text)
          let meetingLink =  linkify.find(announcement.text)[0].href;
          let meeting = {courseName: course.name, link: meetingLink, announcement: announcement.text};
          meetings.unshift(meeting);
          break;
        }
        else if(announcement.materials && linkInMaterials(announcement)){
          let meetingLink = announcement.materials[0].link.url;
          let meeting = {courseName: course.name, link: meetingLink, announcement: announcement.text};
          meetings.unshift(meeting);
          break;
        }
      }
    }
    return meetings;
  }

  function linkInMaterials(announcement){
    var filtered = announcement.materials.filter((material) => {
      if(material.link && (material.link.url.includes('.zoom.') || material.link.url.includes('meet.google.com'))){
        return true;
      }
      return false;
    })
    if(filtered.length > 0){
      return true;
    }
    return false;
  }


  async function getAssignments(courses){
    var assignmentPromises = await courses.map(async(course) => { 
      var courseWork = await getCourseWork(course);
      if(courseWork === undefined){
        console.log(course.name)
      }
      var workPromises = await courseWork.map(async (courseWork) => {
        var filteredWork = await labelCourseWork(course, courseWork);
        return filteredWork;
      })
      courseWork = await Promise.all(workPromises);
      return courseWork;
    });
    var courseAssignments = await Promise.all(assignmentPromises);
    var sortedAssignments = {
      due: [],
      pastDue: [],
      noDueDate: []
    }
    for(var courseWork of courseAssignments){
      for(var assignment of courseWork){
        if(!assignment.submitted){
          if(assignment.dueDate == undefined){
            sortedAssignments.noDueDate.push(assignment);
          }
          else{
            sortDueDates(assignment, sortedAssignments);
          }
        }
      }
    }
    return sortedAssignments;
  }

  async function getCourseWork(course){
    try{
      var res = await classroom.courses.courseWork.list({
        pageSize:50,
        courseId: course.id,
      })
      if(res && res.body.length > 5){
        let courseWork = res.result.courseWork;
        // console.log('Number of coursework in ' + course.name, courseWork.length);
        return courseWork;
      }
    }
    catch(err){
      console.log(err);
    }
  }

  async function labelCourseWork(course, work){
      try{
        var res = await classroom.courses.courseWork.studentSubmissions.list({
          courseId: course.id,
          courseWorkId: work.id
        });
        if(res){
          let submission = res.result.studentSubmissions[0];
          let assignment = {
            courseName: course.name,
            courseWorkId:work.id,
            title: work.title,
            description: work.description,
            link: work.alternateLink,
            dueDate: work.dueDate,
            materials: work.materials,
            submitted: alreadySubmitted(submission)
          }
          if(assignment.dueDate != undefined){
            assignment.dueTime = utcToLocalTime(work);
          }
          return assignment;
        }
      }
      catch(err){
          console.log(err);
      }
  }



  function utcToLocalTime(item){
    let year = item.dueDate.year;
    let month = item.dueDate.month - 1;
    let day = item.dueDate.day;
    let hour = item.dueTime.hours;
    let min = 0;
    if(item.dueTime.minutes){
      min = item.dueTime.minutes;
    }
    let date = new Date(Date.UTC(year, month, day, hour, min));
    let localDate = {hours: date.getHours(), minutes: date.getMinutes()};
    return localDate;
  }

  function alreadySubmitted(submission){
    if (submission.state == "CREATED"){
      return false;
    }
    return true;
  }

