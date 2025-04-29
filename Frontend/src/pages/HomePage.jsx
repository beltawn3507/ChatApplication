import React from 'react'
import { useauthStore } from '../store/authstore.js'


function HomePage() {
  const {authuser} = useauthStore();
  console.log(authuser);
  return (
    <div>
      <h1>{authuser.name}</h1>
      <h1>{authuser.email}</h1>
    </div>
  )
}

export default HomePage