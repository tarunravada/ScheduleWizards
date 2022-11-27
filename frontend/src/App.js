import './App.css';
import React, {useState, useEffect, useRef} from 'react'
import {auth, provider} from './firebase'
import {signInWithPopup} from 'firebase/auth'
import {Button, Link} from 'react-scroll'
import axios from 'axios'
import FlashMessage from 'react-flash-message'


function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState('');
  const [created, setCreated] = useState(false);
  const[color, setColor] = useState(false);
  const [image, setImage] = useState();
  const [uploaded, setUploaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errMessage, setErrorMessage] = useState('');
  const [Resevents, setResEvents] = useState([]);
  const changeColor = () => {
    if(window.scrollY >= 90){
      setColor(true)
    } else {
      setColor(false)
    }
  }

  const inputRef = useRef(null);
  window.addEventListener('scroll', changeColor)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if(authUser){
        // user has logged in
        
        setUser(authUser)
        setUsername(authUser.displayName)
        setEmail(authUser.email)
      } else {
        setUser(null);
        setUsername(null);
        setEmail(null);
      }
    })
    
    return () => {
      //perform some cleanup action
      unsubscribe();
    }
  },[uploaded,user,created,errMessage,Resevents])
  
  const signIn = () => {
    signInWithPopup(auth, provider).then(result => {
      console.log("auth user: "+result)
      setUser(result)
      setUsername(result.displayName)
    })
    .catch(err => console.error(err))
  }

  const signOut = () => {
    auth.signOut();
    axios.get('http://localhost:3001/reset').then(result => {
      console.log("Reset Done")
    })
    .catch(err => console.log(err))
  }
  
  const handleChange = (e) =>{
    if(e.target.files.length < 1){
      setUploaded(false)
      return
    }
    setCreated(false);
    setResEvents([])
    setImage(e.target.files[0]);
    setUploaded(true)
    setLoading(false);
    
  }
  useEffect(() => {
    window.onbeforeunload = function() {
        return true;
    };
    
    return () => {
        window.onbeforeunload = null;
    };
}, [errMessage]);

  const handleExport = () => {
    setErrorMessage('')
    let formData = new FormData();
    formData.append("file",image)
    const post_url = 'https://schedulewizards.ue.r.appspot.com/detect_events';
    setLoading(true)
    axios.post(post_url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(result => {
    setResEvents(result.data.events);
    setLoading(false)
    
    })
    .catch(err => {
      setErrorMessage(err.response.data.message);
      setUploaded(false)
      setLoading(false)
      handleReset()
    })
    
  }

  const handleCreate = () => {
    axios.post('http://localhost:3001/create', Resevents).then(result => {
      setLoading(false)
      setCreated(true)
      setResEvents([]);
    })
    .catch(err => console.log(err))
  }

  const handleInputClick = () => {
    setImage(null);
    setUploaded(false);
    setCreated(false);
    setResEvents([]);
  }

  const handleCancel = () => {
    handleReset();
    setResEvents([]);
  }
  const handleReset = () => {
    inputRef.current.value = null;
    setUploaded(false)
  }
  var arrEvents = [];
  function setEvents(obj1){

    const obj = obj1

    

    for(var i = 0; i < obj.length; i++){
        console.log(obj[i])
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

        arrEvents.push(event)

    }

    


}


function setStartandEnd(obj, time){
  var day = obj.day
  var numDay = 0;

  const time2 = time.split(':');

  

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

  

  const DateReturn = new Date();
  DateReturn.setDate(numDay-1);
  DateReturn.setHours(time2[0], time2[1], 0, 0);


  return DateReturn;
}


  return (
    <div className="App"id='app'>
      <nav className={color?"nav sticky": "nav"}>
        <ul className= "nav_item_container">
          <div className="nav_left">
            <li className="nav_item logo">
              <Link to='app' smooth={true} offset={-150} duration={500}>SW</Link>
            </li>
          </div>
          <div className="nav_right">
            {user?.displayName? (
              <li className="nav_item username">
                <a href="#">{username}</a>
              </li>
            ):(
              <li className="nav_item signinBtn">
              <a type='submit' onClick={signIn}>Sign in</a>
            </li>
            )}
            {user?.displayName? (
              <li className="nav_item signoutBtn">
               <a type='submit' onClick={signOut}>Sign out</a>
              </li>
            ):(<></>)}
            
          </div>
        </ul>
      </nav>
      
      
      <div className="intro" id='int'>
        <div className="intro_container">
            <div className="intro_left">

            </div>
            <div className="intro_right">
              <h3 className="intro_text">Export schedule to your Google Calender within moments!</h3>
              {user? (
                <Link to='ups' smooth={true} offset={50} duration={500} className="tryBtn">Try it!</Link>
              ):(
                <a href="#"  onClick={signIn} className="tryBtn">Sign in</a>
              )}
              
            </div>
        </div>
      </div>
      {user? (
        <div className="uploadSection" id="ups">
          <div className="upload_form_container">
          
            <h3 className="upload_title">UPLOAD AN IMAGE FILE OF YOUR SCHEDULE</h3>
            <div className="upload_form_top">
              <input ref={inputRef} onClick={handleInputClick} className="upload_input" type="file" accept='.jpg,.jpeg,.png' onChange={handleChange} />
              
            </div>
            
            {uploaded && !created?(
              <div className="upload_form_bottom">
                {Resevents.length == 0 && uploaded && !loading?(<a href="#ups" onClick={handleExport} className="upload_create_btn">Export</a>):<></>}
              </div>
              
            ):<></>}
            {loading? <strong className="loading-text">Loading..</strong>:<></>}
            {errMessage == '' ? <></>: (
                <div className="flashContainer">
                  <FlashMessage  duration={5000}>
                    <strong className="error_flash_message"><h2>&#128533;</h2>{errMessage}</strong>
                  </FlashMessage>
                </div>
                
            )}
            {Resevents.length > 0? 
            (
              <>
              <div className="events-container">
                <p className="events-container-title">Confirm events to create</p>
                  {Resevents.map(eve => (
            
                    <div className="display-events">
                      <strong><span className="event-labels">Class: </span>{eve.class}</strong>
                      <strong><span className="event-labels">Day: </span>{eve.day}</strong>
                      <strong><span className="event-labels">Start time: </span>{eve.start_time}</strong>
                      <strong><span className="event-labels">End time: </span>{eve.end_time}</strong>
                      <strong><span className="event-labels">Location: </span>{eve.location}</strong>
                    </div>
                  ))}
                  <div className="action-btn-container">
                    <a href="#ups" className="confirm-btn" onClick={handleCreate}>Confirm</a>
                    <a href="#ups" className="cancel-btn" onClick={handleCancel}>Cancel</a>
                  </div>
                  
              </div>
              
              </>
              
            
            )
            :(<></>)}
            {(created && !loading)? <a href="https://www.google.com/calendar" target="_blank" className="view_event_btn">View Calender</a>: <></>}
          </div>
          
        </div>

      ):(<></>)}
      
    </div>
    
  );
  
}

export default App;
