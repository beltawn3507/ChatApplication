import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

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
      toast.error(error.response.data.message);
    } finally {
      set({ isuserloading: false });
    }
  },

  getMessages: async (userId) => {
    console.log("get messages activated")
    set({ ismessageloading: true });
    try {
      const res =await axiosInstance.get(`/message/${userId}`);
      console.log("received messages",res);
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
     console.log("message data send",messagedata);
     const {selecteduser,messages} = get();
     try {
       const res=await axiosInstance.post(`/message/send/${selecteduser._id}`,messagedata);
      //  console.log("response from server",res)
       set({messages:[...messages,res.data]});
     } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
     }
  },

  //subscribe message

  //unsuscribe message



}));
