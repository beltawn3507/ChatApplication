import { useState } from 'react'
import './App.css'
import { Toaster } from "react-hot-toast";
import Navbar from './Component/Navbar'
import {Routes,Route,Navigate} from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx'
import SettingPage from './pages/SettingPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { useauthStore } from './store/authstore.js'
import { useEffect } from 'react'
import {Loader} from 'lucide-react'
import {usethemeStore} from "./store/themeStore.js"

function App() {
  
  const {authuser,checkauth,isCheckingAuth} = useauthStore();
  const {theme} =usethemeStore();

  useEffect(()=>{
    console.log("checking auth oh yeahhhfhf");
    checkauth();
  },[checkauth]);

  console.log("authuser status",authuser);
  
  //console.log(isCheckingAuth);

  if (isCheckingAuth && !authuser) 
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
   
  return (
    <div data-theme={theme} >
     <Navbar/>
     
     <Routes>
      <Route path='/'  element={authuser?<HomePage/>:<Login/>}/>
      <Route path="/signup" element={!authuser ? <SignUp /> : <Navigate to="/" />} />
      <Route path="/login" element={
  (() => {
    console.log("Login route accessed, auth state:", authuser);
    return !authuser ? <Login /> : <Navigate to="/" />;
  })()
} />
      <Route path='/settings'  element={<SettingPage/>}/>
      <Route path="/profile" element={authuser ? <ProfilePage /> : <Navigate to="/login" />} />
     </Routes>

     <Toaster />
    </div>
  )
}

export default App
