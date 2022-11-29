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
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(false)
  const [checkedNo, setCheckedNo] = useState(0)
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
  const eventsRef = useRef(null);
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
  },[uploaded,user,created,errMessage,Resevents,selectedEvents])
  
  const handleCheck = (event) => {
    var events_array = [...selectedEvents];
    if (event.target.checked) {
      events_array = [...selectedEvents, event.target.value];
      setSelectedEvents(events_array);
      setCheckedNo(checkedNo + 1)
    } 
    else  {
      var class_name = JSON.stringify(JSON.parse(event.target.value).class)
      var day_name = JSON.stringify(JSON.parse(event.target.value).day)
      let fresh_array = events_array.filter(val => {
        return (JSON.stringify(JSON.parse(val).class) != class_name) && JSON.stringify(JSON.parse(val).day) != day_name
      })
      setSelectedEvents(fresh_array);
      setCheckedNo(checkedNo - 1)
    }
    
    
    
  };
  
  const signIn = () => {
    signInWithPopup(auth, provider).then(result => {
      setUser(result)
      setUsername(result.displayName)
    })
    .catch(err => console.error(err))
  }

  const signOut = () => {
    auth.signOut();
    axios.get('http://localhost:3001/reset').then(result => {
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
    if(checkedNo == 0){
      setErrorMessage('Please select atleast 1 event')
      return
    }
    var final_array = [];
    selectedEvents.forEach(seve => {
      final_array.push(JSON.parse(seve))
    })
    axios.post('http://localhost:3001/create', final_array).then(result => {
      setLoading(false)
      setCreated(true)
      setResEvents([]);
      setSelectedEvents([]);
    })
    .catch(err => console.log(err))
  }

  const handleInputClick = () => {
    setImage(null);
    setUploaded(false);
    setCreated(false);
    setResEvents([]);
    setSelectedEvents([])
    setCheckedNo(0)
  }

  const handleCancel = () => {
    handleReset();
    setResEvents([]);
    setSelectedEvents([]);
    
  }
  const handleReset = () => {
    inputRef.current.value = null;
    setUploaded(false)
  }
  

  return (
    <div className="App"id='app'>
      <nav className={color?"nav sticky": "nav"}>
        <ul className= "nav_item_container">
          <div className="nav_left">
            <li className="nav_item logo">
              <Link to='app'  smooth={true} offset={-150} duration={500}><span className="logo-text">Schedule Wizard ++</span></Link>
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
                <p className="events-container-title">Select events to create</p>
                  {Resevents.map(eve => (
                    
                    <div className="events-form-container">
                      <input type="checkbox" className="checkbox-input" onChange={handleCheck} value={JSON.stringify(eve)} ref={eventsRef}></input>
                      <div className="display-events">
                      <strong><span className="event-labels">Class: </span>{eve.class}</strong>
                      <strong><span className="event-labels">Day: </span>{eve.day}</strong>
                      <strong><span className="event-labels">Start time: </span>{eve.start_time}</strong>
                      <strong><span className="event-labels">End time: </span>{eve.end_time}</strong>
                      <strong><span className="event-labels">Location: </span>{eve.location}</strong>
                    </div>
                    </div>                    
                    
                  ))}
                  <div className="action-btn-container">
                    <a href="#ups" className="confirm-btn" onClick={handleCreate}>Create</a>
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
