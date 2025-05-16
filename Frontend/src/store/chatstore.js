import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {useauthStore} from "./authstore.js"



export const usechatstore = create((set,get) => ({
  //state vcriables
  messages: [],
  users: [],
  selecteduser: null,
  isuserloading: false,
  ismessageloading: false,
  

  //function

  getusers: async () => {
    set({ isuserloading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error("error 404");
    } finally {
      set({ isuserloading: false });
    }
  },

  getMessages: async (userId) => {
    console.log("get messages activated")
    set({ ismessageloading: true });
    try {
      const res =await axiosInstance.get(`/message/${userId}`);
      // console.log("received messages",res);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ ismessageloading: false });
    }
  },

  
  setselecteduser: (user) => {
    set({ selecteduser: user });
  },

  sendMessages: async(messagedata)=>{
    //  console.log("message data send",messagedata);
      
    //  try {
    //    const res=await axiosInstance.post(`/message/send/${selecteduser._id}`,messagedata);
    //   //  console.log("response from server",res)
    //   
    //  } catch (error) {
    //   console.log(error);
    //   toast.error(error.response.data.message);
    //  }
    const authuser=useauthStore.getState().authuser;
    const {selecteduser,messages} = get();
    const socket=useauthStore.getState().socket;
    socket.emit("sendMessage",{...messagedata,receiverId:selecteduser._id,senderId:authuser._id});
    
  },

  //subscribe message
   listenformessage:()=>{
     const socket=useauthStore.getState().socket;
     socket.on("newMessage",(receivedmessage)=>{
        console.log("message via webscoket",receivedmessage)
        var {messages}=get();
        console.log("messages",messages);
        set({
          messages:[...messages,receivedmessage]
        })
     })
   }
  //unsuscribe message
   


}));
