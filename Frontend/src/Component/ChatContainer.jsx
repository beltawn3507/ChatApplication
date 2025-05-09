import React from "react";
import { useEffect, useRef } from "react";
import { usechatstore } from "../store/chatstore.js";
import { useauthStore } from "../store/authstore.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from './MessageInput';
import MessageSkeleton from "./MessageSkeleton.jsx";

function ChatContainer() {
  const {
    messages,
    ismessageloading,
    getMessages,
    selecteduser,
    // subscribeToMessages,
    // unsubscribeFromMessages,
  } = usechatstore();


  useEffect(()=>{
    getMessages(selecteduser._id);
  },[]);

  if(ismessageloading) return (
    <div className="flex-1 flex-col flex-overflow-auto">
    <ChatHeader/>
     <MessageSkeleton/>
    <MessageInput/>
    </div>
  )


  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      {/* messages will go here */}





      <MessageInput />
    </div>
  );
}

export default ChatContainer;
