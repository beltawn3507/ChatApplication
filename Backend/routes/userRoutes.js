import express from 'express';
import {
  registerUser,
  handleLogin,
  logout,
  updateProfile,
  checkauth
} from '../controller/userController.js';

import {
  authenticate,
  authorizeadmin
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', handleLogin);
router.post('/register', registerUser);
router.get('/logout', logout);
router.put('/update-profile', authenticate, updateProfile);
router.get('/check', authenticate, checkauth);

export default router;
