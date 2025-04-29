import jwt from 'jsonwebtoken';

const SECRET = 'kdbakjdajkdsajdsadajn';

const generateToken = (res, _id) => {
  const token = jwt.sign({ _id }, SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });

  return token;
};

export default generateToken;
