import {create } from 'zustand';

export const usethemeStore=create((set)=>({
   theme:localStorage.getItem("chat-theme")||'synthwave',

   setTheme:(data)=>{
      localStorage.setItem("chat-theme",data);
      set({theme:data})
   }
}));

