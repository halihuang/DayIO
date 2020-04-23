const ElectronGoogleOAuth2 = require('@getstation/electron-google-oauth2').default;
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const TOKEN_PATH = 'token.json';
const SCOPE = ['https://www.googleapis.com/auth/classroom.courses.readonly'];
var credentials = "";
var authorizeButton;
var signoutButton;

setButtons();

function setButtons(){
  authorizeButton = $('#authorize_button');
  signoutButton = $('#signout_button');
  authorizeButton.click(() => {
    updateSigninStatus(true);
    authorize(credentials, listCourses, false);
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
}


fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  credentials = JSON.parse(content);
  authorize(credentials, listCourses, true);
});


function authorize(credentials, callback, start) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err && !start) return getAccessToken(oAuth2Client, callback, credentials);
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
  function listCourses(auth) {
  const classroom = google.classroom({version: 'v1', auth});
  classroom.courses.list({
    pageSize: 10,
  }, (err, res) => {
    if (err) {
      fs.unlink(TOKEN_PATH, () => {
        return console.log('The API returned an error: ' + err);
      });
    }
    const courses = res.data.courses;
    window.courses = courses;
    if (courses && courses.length) {
      console.log('Courses:');
      courses.forEach((course) => {
        console.log(`${course.name} (${course.courseWork})`);
      });
    }
    else {
      console.log('No courses found.');
    }
  });
}
