import { useState,useEffect} from "react";
import { usechatstore } from "../store/chatstore"
import { useauthStore } from './../store/authstore';


const SideBar = () => {

  const {users,selectedusers,isuserloading,getusers,setselectedusers} = usechatstore();
  const  {onlineusers} = useauthStore();
  //usestate to filter online or not
  const [isOnline,setIsOnline]=useState(false);
  
  //whenever the page loads all the users automatically loads and get stored to users
  useEffect(()=>{
    getusers();
  },[])

  return (
    <div>
      Sidebar
    </div>
  )
}

export default SideBar
