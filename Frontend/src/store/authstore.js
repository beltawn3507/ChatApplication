import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "./../lib/axios";
import toast from "react-hot-toast";

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
          return; // already have user from storage
        }
      
        try {
          console.log("Checking authentication from API...");
          const res = await axiosInstance.get("/user/check");
          console.log("Auth check response:", res.data);
          set({ authuser: res.data });
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
