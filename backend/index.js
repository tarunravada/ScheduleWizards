const express = require('express');

const app = express();

const port = 3001;
const Fs = require('fs');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser')
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
var createdlink = "";
let eves = [];
app.use(cors());
app.use(bodyParser.json())

  var arrEvents = [];
  function setEvents(obj1){

    const obj = obj1

    

    for(var i = 0; i < obj.length; i++){
        
        const eventStartTime = setStartandEnd(obj[i], obj[i].start_time);
        const eventEndTime = setStartandEnd(obj[i], obj[i].end_time);

        const event = {
            summary: obj[i].class,
            location: obj[i].location + " UNCC",
            description: obj[i].class,
            start: {
                dateTime: eventStartTime,
                timeZone: 'America/New_York'
            },
            end: {
                dateTime: eventEndTime,
                timeZone: 'America/New_York'
            },
            recurrence: [
              "RRULE:FREQ=WEEKLY;UNTIL=20221212T170000Z",
            ],
            colorId: 1 
        }

        //console.log(event)
        //console.log(i)

        arrEvents.push(event)

    }

    //console.log(arrEvents)

    // for(var i = 0; i < arrEvents.length; i++){
    //     insertEvent(arrEvents[i], arrEvents[i].start.dateTime, arrEvents[i].end.dateTime)
    // }


}


function setStartandEnd(obj, time){
  var day = obj.day
  var numDay = 0;

  const time2 = time.split(':');

  //console.log(day);

  switch(day) {
      case "Monday":
          numDay = 1
          break;
      case "Tuesday":
          numDay = 2
          break;
      case "Wednesday":
          numDay = 3
          break;
      case "Thursday":
          numDay = 4
          break;
      case "Friday":
          numDay = 5
          break;
      case "Saturday":
          numDay = 6
          break;
      case "Sunday":
          numDay = 7
          break;
  }

  //console.log(numDay);
  //console.log(time2[0]);

  const DateReturn = new Date();
  DateReturn.setDate(numDay-1);
  DateReturn.setHours(time2[0], time2[1], 0, 0);

  //console.log(DateReturn);
  return DateReturn;
}
app.post('/create', (req, res) => {
  eves = req.body;
  setEvents(eves);

  async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }
  
  /**
   * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
  async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }
  
  /**
   * Load or request or authorization to call APIs.
   *
   */
  async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    
    return client;
  }
  
  
  async function create(auth){
    const calendar = google.calendar({version: 'v3', auth});
    arrEvents.forEach(e => {
      calendar.freebusy.query({
        resource: {
          timeMin: e.start.dateTime,
          timeMax: e.end.dateTime,
          timeZone: 'America/New_York',
          items: [{id: 'primary'}]
      }
      }, (err, resp) => {
        if(err) return console.error('Free Busy Query Error: ', err)

        const eventsArr = resp.data.calendars.primary.busy
        
        if(eventsArr.length === 0){
          
          calendar.events.insert({
            calendarId: 'primary',
            resource: e,
          }, function(err, eve) {
            if (err) {
              console.log('There was an error contacting the Calendar service: ' + err);
              return;
            }
        
            // console.log(eve);
            
          });
        } else {
          res.send("One or More events are conflicting with existing an event.")
          return;
          
        }
      })
      
    })
    res.send("Success");
  }
  authorize().then(rec_auth => {
    create(rec_auth).then(event => {
      arrEvents = [];
      
    })
  }).catch(console.error);

})

app.get('/reset', (req, res) => {
  Fs.stat('./token.json', function (err, stats) {
        
    if (err) {
        return console.error(err);
    }
 
    fs.unlink('./token.json',function(err){
         if(err) return console.log(err);
         console.log('file deleted successfully');
    });  
 });
})


app.listen(port, () => {
    console.log('Listening on port ' + port);
});