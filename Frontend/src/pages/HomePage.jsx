import React from "react";
import { usechatstore } from "../store/chatstore.js";
import SideBar from "../Component/SideBar.jsx";
import NoChatSelected from "../Component/NoChatSelected.jsx";
import ChatContainer from "../Component/ChatContainer.jsx";

function HomePage() {
  const { selecteduser } = usechatstore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <SideBar/>

            {!selecteduser?  <NoChatSelected/> : <ChatContainer/> }

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
