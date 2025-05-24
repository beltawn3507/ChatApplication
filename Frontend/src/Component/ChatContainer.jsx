import React from "react";
import { useEffect, useRef } from "react";
import { usechatstore } from "../store/chatstore.js";
import { useauthStore } from "../store/authstore.js";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton.jsx";
import { formatMessageTime } from "../lib/utils";

function ChatContainer() {
  const {
    messages,
    ismessageloading,
    getMessages,
    selecteduser,
    listenformessage,
    stoplisteningformessage
  } = usechatstore();
   
  const {authuser} =useauthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selecteduser._id);

    listenformessage();

    return ()=>stoplisteningformessage();
  }, [selecteduser._id, getMessages,listenformessage]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  

  // console.log(`messages with ${selecteduser.name}`,messages);
  if (ismessageloading)
    return (
      <div className="flex-1 flex-col flex-overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      {/* messages will go here */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4`}>
        
        {messages.map((message) => (
          
          <div key={message._id} className={`chat ${message.senderId === authuser._id ? "chat-end" : "chat-start"}`} ref={messageEndRef} >
            <div className={`chat-image avatar`}>
              <div className="w-10 rounded-full">
                <img
                  alt="user profile"
                  src={message.senderId===authuser._id ? authuser.profilepic : selecteduser.profilepic}
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
}

export default ChatContainer;
