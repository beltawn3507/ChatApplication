import {Server} from 'socket.io';
import http from "http";
import express from "express"

const app=express();
const server=http.createServer(app);

const onlineusersmap={};//{userid:socketid};

const io=new Server(server,{
    cors: {
    origin: ["http://localhost:5173"],
  },
});

io.on("connection",(socket)=>{
    //console.log("A user just connected",socket.id);
    const userid=socket.handshake.query.userId;
    console.log("userid",userid);
    if(userid) onlineusersmap[userid]=socket.id;
    io.emit('getonlineusers',Object.keys(onlineusersmap));

    socket.on("disconnect",()=>{
       // console.log("A user just disconnected",socket.id);
       delete onlineusersmap[userid];
       io.emit('getonlineusers',Object.keys(onlineusersmap));
})
})


export {io,app,server};



