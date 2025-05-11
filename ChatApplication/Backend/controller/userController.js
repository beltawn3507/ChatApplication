import User from '../model/UserModel.js';
import cloudinary from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/createToken.js';

const registerUser = async (req, res) => {
  const { name, email, password, profilepic } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  const existinguser = await User.findOne({ email });
  if (existinguser) {
    return res.status(404).json({ message: "User already registered" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedpassword,
      profilepic,
    });

    const token = generateToken(res, user._id);

    console.log(user);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profilepic: user.profilepic,
      
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Enter all the fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profilepic: user.profilepic,
      
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userid = req.user._id; 

    if (!profilepic) {
      return res.status(401).json({ message: "No profile picture provided" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilepic);
    const updatedUser = await User.findByIdAndUpdate(
      userid,
      { profilepic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const checkauth = async (req, res) => {
  try {
    //console.log(req.user);
    if(req.user){
      return res.status(200).json(req.user);
    }
    
  } catch (error) {
    console.log("checkauth",error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { registerUser, handleLogin, logout, updateProfile, checkauth };
