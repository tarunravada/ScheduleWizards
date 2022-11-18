import './App.css';
import React, {useState, useEffect} from 'react'
import {auth, provider} from './firebase'
import {signInWithPopup} from 'firebase/auth'
import {Link} from 'react-scroll'
import axios from 'axios'
function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState('');
  const[color, setColor] = useState(false);
  const [uploaded, setUploaded] = useState(false) 
  const changeColor = () => {
    if(window.scrollY >= 90){
      setColor(true)
    } else {
      setColor(false)
    }
  }
  
  
  window.addEventListener('scroll', changeColor)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if(authUser){
        // user has logged in
        console.log(authUser)
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
  },[uploaded,user])
  
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
  }
  
  const handleChange = (e) =>{
    if(e.target.files.length < 1){
      setUploaded(false)
      return
    }
    let formData = new FormData();
    formData.append("file",e.target.files[0])
    setUploaded(true)
    console.log(formData)
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
            <h3 className="upload_title">UPLOAD A FILE</h3>
            <div className="upload_form_top">
              <input className="upload_input" type="file" accept='application/pdf' onChange={handleChange} />
            </div>
            {uploaded?(
              <div className="upload_form_bottom">
                <a href="#ups" className="upload_create_btn">Export</a>
              </div>
            ):<></>}
            
          </div>
        </div>

      ):(<></>)}
      
    </div>
    
  );
  
}

export default App;
