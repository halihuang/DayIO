const ElectronGoogleOAuth2 = require('@getstation/electron-google-oauth2').default;
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const TOKEN_PATH = 'token.json';
var credentials = "";
var authorizeButton;
var signoutButton;

export function setButtons(){
  authorizeButton = $('#authorize_button');
  signoutButton = $('#signout_button');
  authorizeButton.click(() => {
    authorize(credentials, listEvents, false);
    updateSigninStatus(true);
  });

  signoutButton .click(() => {
    fs.unlink(TOKEN_PATH, () => {});
    updateSigninStatus(false);
  });

}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}


fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  credentials = JSON.parse(content);
  authorize(credentials, listEvents, false);
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
  const myApiOauth = new ElectronGoogleOAuth2(
    '758516973815-remfsil78lce586osdckvd8itv63sn91.apps.googleusercontent.com',
    'RKxuHbHcG3vp9Ma8llIJoVjX',
    ['https://www.googleapis.com/auth/calendar.readonly']
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


function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) {
      fs.unlink(TOKEN_PATH, () => {
        return console.log('The API returned an error: ' + err);
      });
    }
    const events = res.data.items;
    window.events = events;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });







}
