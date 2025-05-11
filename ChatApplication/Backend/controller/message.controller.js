import User from "../model/UserModel.js";
import Message from "../model/message.model.js";
import cloudinary from "../utils/cloudinary.js"

export const getUsersforsidebar = async (req, res) => {
  try {
    const loggedinuserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedinuserId },
    }).select("-password");
    //console.log(filteredUsers);
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Interval Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const senderId = req.params.id;

    const allmessages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: myId },
        { senderId: myId, receiverId: senderId },
      ],
    });
    res.status(200).json(allmessages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Interval Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    
    const receiverId=req.params.id;
    const senderId=req.user._id;
    const {text,image}=req.body;
    let imageurl="";
    if(image){
      const uploadresponse = await cloudinary.uploader.upload(image);
      imageurl=uploadresponse.secure_url;
    }

    const NewMessage=new Message({
        senderId,
        receiverId,
        text,
        image:imageurl
    })

    await NewMessage.save();
    
   // <<Socket implementation>>

    res.status(200).json(NewMessage);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Interval Server Error" });
  }
};
