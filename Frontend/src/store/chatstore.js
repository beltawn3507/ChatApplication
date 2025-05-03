import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const usechatstore = create((set) => ({
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
    set({ ismessageloading: true });
    try {
      const res = axiosInstance.get(`/message/${userId}`);
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
}));
