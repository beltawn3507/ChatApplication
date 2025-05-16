import { Server } from "socket.io";
import http from "http";
import express from "express";
import cloudinary from "./cloudinary.js"
import Message from "../model/message.model.js"

const app = express();
const server = http.createServer(app);

const onlineusersmap = {}; //{userid:socketid};

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

io.on("connection", (socket) => {
  //console.log("A user just connected",socket.id);
  const userid = socket.handshake.query.userId;

  //console.log("userid",userid);
  if (userid) onlineusersmap[userid] = socket.id;
  io.emit("getonlineusers", Object.keys(onlineusersmap));

  socket.on("disconnect", () => {
    // console.log("A user just disconnected",socket.id);
    delete onlineusersmap[userid];
    io.emit("getonlineusers", Object.keys(onlineusersmap));
  });

  socket.on("sendMessage", async(data) => {
    const { text, image, senderId, receiverId } = data;
    let imageurl = "";
    if(image){
          const uploadresponse = await cloudinary.uploader.upload(image);
          imageurl=uploadresponse.secure_url;
        }

    try {
      //emit this temp message via web socket
      const tempMessage = {
        _id: new Date().getTime(),
        text: text,
        senderId,
        receiverId,
        image: imageurl,
        createdAt: new Date(),
      };

      const receiverSocketId = getsocketid(receiverId);
      const senderSocketId = getsocketid(senderId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", tempMessage);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", tempMessage);
      }

      //now we will if there is image we will upload on cloud and then we will save this message to our database

      const savedMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageurl,
      });

      await savedMessage.save();



    } catch (error) {
      console.error("Failed to save message:", error);
      // optionally emit "messageFailed" to sender
    }
  });
});

const getsocketid = (userid) => {
  return onlineusersmap[userid];
};

export { io, app, server, getsocketid };
