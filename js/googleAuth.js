const ElectronGoogleOAuth2 = require('@getstation/electron-google-oauth2').default;
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const TOKEN_PATH = 'token.json';
const SCOPE = ['https://www.googleapis.com/auth/classroom.courses.readonly',
 'https://www.googleapis.com/auth/classroom.coursework.me.readonly', 'https://www.googleapis.com/auth/classroom.announcements.readonly'];
var classroom;
var credentials = "";
var authorizeButton;
var signoutButton;
var coursesLength;
var loaded = {}

setButtons();


function setButtons(){
  authorizeButton = $('#authorize_button');
  signoutButton = $('#signout_button');
  authorizeButton.click(() => {
    authorize(credentials, refreshClassroom, false);
  });

  signoutButton .click(() => {
    updateSigninStatus(false);
    fs.unlink(TOKEN_PATH, () => {});
  });

}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    document.getElementById("authorize_button").style.display = 'none';
    document.getElementById("signout_button").style.display = 'block';
  } else {
    document.getElementById("authorize_button").style.display = 'block';
    document.getElementById("signout_button").style.display = 'none';
  }
  window.signedIn = isSignedIn;
}


fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  credentials = JSON.parse(content);
  authorize(credentials, refreshClassroom, true);
});


function authorize(credentials, callback, start) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err){
      if(!start){
         return getAccessToken(oAuth2Client, callback, credentials);
      }
      console.log("no token.json found");
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
    updateSigninStatus(true);
  });
}


function getAccessToken(oAuth2Client, callback, credentials){
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const myApiOauth = new ElectronGoogleOAuth2(
    client_id,
    client_secret,
    SCOPE
  );


  myApiOauth.openAuthWindowAndGetTokens()
    .then(token => {
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
      updateSigninStatus(true);
    });
}


// function listEvents(auth) {
//   const calendar = google.calendar({version: 'v3', auth});
//   calendar.events.list({
//     calendarId: 'primary',
//     timeMin: (new Date()).toISOString(),
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: 'startTime',
//   }, (err, res) => {
//     if (err) {
//       fs.unlink(TOKEN_PATH, () => {
//         return console.log('The API returned an error: ' + err);
//       });
//     }
//     const events = res.data.items;
//     window.events = events;
//     if (events.length) {
//       console.log('Upcoming 10 events:');
//       events.map((event, i) => {
//         const start = event.start.dateTime || event.start.date;
//         console.log(`${start} - ${event.summary}`);
//       });
//     } else {
//       console.log('No upcoming events found.');
//     }
//   });
// }

  function refreshClassroom(auth) {
    classroom = google.classroom({version: 'v1', auth});
    classroom.courses.list({
      pageSize: 10,
    }, (err, res) => {
      if (err) {
        fs.unlink(TOKEN_PATH, () => {
          return console.log('The API returned an error: ' + err);
        });
      }
      const courses = res.data.courses;

      if (courses && courses.length) {
        // console.log('Work:');
        getClassroomInfo(courses);
      }
      else {
        console.log('No courses found.');
      }

      let x = 300;  // 5 minutes

      // if signed in refresh every 5 minutes;
      if(window.signedIn){
        setTimeout(refreshClassroom, x*1000);
      }
    });

  }

  // organizes classroom assignments by date and saves them in a json
  function getClassroomInfo(courses){
    var meetings = {
        data: []
    };
    var assignments = {
      due: [],
      pastDue: [],
      noDueDate: [],
    };
    classroom.courses.list({
      pageSize: 15
    }, (err,res) =>{
      fs.writeFile('courses.json', JSON.stringify(res.data), (err) => {
        if(err){
          console.log('couldnt save courses');
        }
        console.log("courses saved successfully");
      });
    });

    coursesLength = courses.length;
    loaded.courseAssignments = 0;
    loaded.courseMeetings = 0;

    courses.forEach((course) => {
      getAssignments(course, assignments).then((res) => {
        console.log(JSON.stringify(assignments))
        fs.writeFile('classroomAssignments.json', JSON.stringify(assignments), (err) => {
          if(err){
            return console.log('couldnt save past assignments');
          }
          console.log("classroom assignments saved successfully");
        });
      }, (err) => {

      });
      getMeetings(course, meetings).then((res) => {
        // console.log(JSON.stringify(meetings.data));
        fs.writeFile('classroomMeetings.json', JSON.stringify(meetings.data), (err) => {
          if(err){
            return console.log('couldnt save past assignments');
          }
          console.log("classroom meetings saved successfully");
        });
      }, (err) => {

      });
    });
  }

  function getMeetings(course, meetings){
    return new Promise((resolve, reject) => {
      var linkify = require('linkifyjs');
      classroom.courses.announcements.list({
        courseId: course.id,
        pageSize:5,
      }, (err, res) => {
        let announcements = res.data.announcements;

        // console.log(course.name, announcements);
        for(let announcement of announcements){
          if(announcement.text.includes('.zoom.')){
            let meetingLink =  linkify.find(announcement.text)[0];
            let meeting = {courseName: course.name, link: meetingLink};
            meetings.data.unshift(meeting);
            break;
          }
          else if(announcement.text.includes('meet.google.com')){
            let meetingLink =  linkify.find(announcement.text)[0];
            let meeting = {courseName: course.name, link: meetingLink};
            meetings.data.unshift(meeting);
            break;
          }
        }
        loaded.courseMeetings++;
        if(loaded.courseMeetings == coursesLength){
          resolve('loaded all courses');
        }
        else{
          reject('didnt load all courses yet')
        }
      });
    });
  }

  function getAssignments(course, assignments, counter){
    return new Promise((resolve, reject) => {
      classroom.courses.courseWork.list({
        pageSize:15,
        courseId: course.id,
      }, (err, res) => {
        if(err){
          return console.log("could not find course:" + err);
        }
        let courseWork = res.data.courseWork;
        // console.log('Number of coursework in ' + course.name, courseWork.length);
        let loadedCourseWork = {count: 0};

        courseWork.forEach((work) =>{
          filterCourseWork(course, work, assignments, courseWork, loadedCourseWork).then((res) => {
              // console.log(res);
              loaded.courseAssignments++;
              if(loaded.courseAssignments == coursesLength){
                resolve('loaded all courses');
              }
              else{
                reject('didnt load all courses yet');
              }
            }, (err) => {
              // console.log(err);
            }
          );
        });
      });
    });
  }

  function filterCourseWork(course, work, assignments, allCourseWork, counter){
    return new Promise((resolve, reject) =>{
        classroom.courses.courseWork.studentSubmissions.list({
          courseId: course.id,
          courseWorkId: work.id
        }, (err, res) => {
          if(err){
            return console.log("could not find course submissions:" + err);
          }
          let submission = res.data.studentSubmissions[0];
          let assignment = {
            courseName: course.name,
            courseId:work.id,
            title: work.title,
            description: work.description,
            link: work.alternateLink,
            dueDate: work.dueDate,
            materials: work.materials,
          }
          if(!alreadySubmitted(submission)){
            if(assignment.dueDate == undefined){
              assignments.noDueDate.push(assignment);
            }
            else{
              assignment.dueTime = utcToLocalTime(work);
              if(stillDue(assignment)){
                // insert into due json based on date;
                sortBasedOnTime(assignments.due, assignment);
              }
              else if(validPastDate(assignment.dueDate)){
                // insert into past json based on date
                sortBasedOnTime(assignments.pastDue, assignment);
              }
            }
          }
          counter.count++;
          if(counter.count == allCourseWork.length){
            resolve('loaded all course work');
          }
          else{
            reject("Coursework loaded so far::: " + counter.count + ' in ' + course.name);
          }
        });
      });
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

  function sortBasedOnTime(arr, inserted){
    if(arr.length){
      for(let i = 0; i < arr.length; i++){
        let item = arr[i];
        if(compareDueDates(item, inserted)){
          arr.splice(i, 0, inserted);
          break;
        }
      }
    }
    else{
      arr.push(inserted);
    }
  }

  // checks if an assignment is still due
  function stillDue(assignment){
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    let currentDate = {dueDate: {
                          year:year,
                          month:month,
                          day:day
                        },
                        dueTime: {
                          hours: date.getHours(),
                          minutes: date.getMinutes()
                        }
                      }

    return compareDueDates(assignment, currentDate);
  }


  function simplifyAssignmentDueDate(assignment){
    let dueDate = {
      year: assignment.dueDate.year,
      month: assignment.dueDate.month,
      day: assignment.dueDate.day,
      hours: assignment.dueTime.hours,
      minutes: assignment.dueTime.hours,
    }
    return dueDate
  }
  // compares if due date1 is due after duedate2
  function compareDueDates(assignment, assignment2){
    let dueDate1 = simplifyAssignmentDueDate(assignment);
    let duedate2 = simplifyAssignmentDueDate(assignment2);

    if(dueDate1.year < duedate2.year){
      return false;
    }
    if(dueDate1.month < duedate2.month){
      return false;
    }
    if(dueDate1.day < duedate2.day && dueDate1.month == duedate2.month){
      return false;
    }
    if(dueDate1.hours < duedate2.hours){
      return false;
    }
    if(dueDate1.hours == duedate2.hours && dueDate1.minutes < duedate2.minutes){
      return false;
    }
    return true;
  }

  function validPastDate(pastDate){
    let date = new Date();
    let year = date.getFullYear()
    let month = date.getMonth()
    let day = date.getDay();
    if((year - pastDate.year < 2) && ((year - pastDate.year) * 4 + month < 12)){
      return true;
    }
    return false;
  }
