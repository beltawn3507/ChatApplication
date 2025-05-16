import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "./../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:3000";

export const useauthStore = create(
  persist(
    (set, get) => ({
      // variables
      authuser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,
      onlineUsers: [],
      socket: null,

      // functions
      checkauth: async () => {
        const { authuser } = get();
        if (authuser) {
          set({ isCheckingAuth: false });
          get().connectSocket();
          return; // already have user from storage
        }

        try {
          // console.log("Checking authentication from API...");
          const res = await axiosInstance.get("/user/check");
          // console.log("Auth check response:", res.data);
          set({ authuser: res.data });
          get().connectSocket();
        } catch (error) {
          console.log("Auth check error:", error);
          set({ authuser: null });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/user/register", data);
          const { token, ...user } = res.data;
          set({ authuser: user });
          toast.success("Account created successfully");
          get().connectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/user/login", data);
          const { token, ...user } = res.data;
          set({ authuser: user });
          toast.success("Logged in Successfully");
          get().connectSocket();
        } catch (error) {
          console.log(error);
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          const res = await axiosInstance.get("/user/logout");
          set({ authuser: null });
          toast.success("Logged out successfully");
          get().disconnectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },

      updateprofile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/user/update-profile", data);
          set({ authuser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error(error.response.data.message);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

      connectSocket: () => {
        const { authuser } = get();
        if (!authuser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
          query: {
            userId: authuser._id,
          },
        });
        socket.on("getonlineusers",(userid)=>{
          set({onlineUsers:userid});
        })
        
        set({ socket: socket });
      },

      disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
      },
    }),
    {
      name: "auth", // key name in localStorage
      partialize: (state) => ({
        authuser: state.authuser,
        // only persist authuser, not loading flags or socket
      }),
    }
  )
);
