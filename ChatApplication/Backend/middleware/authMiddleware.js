import jwt from 'jsonwebtoken';
import User from '../model/UserModel.js';

const SECRET = 'kdbakjdajkdsajdsadajn'; // use env

export const authenticate = async (req, res, next) => {
  const token = req.cookies.jwt;
  //console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    //console.log(decoded);
    const user = await User.findById(decoded._id).select('-password');
    //console.log(user);

    if (!user) {
      return res.status(404).json({ message: "not authenticated correctly brooo" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized - Invalid or Expired Token' });
  }
};

export const authorizeadmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};
