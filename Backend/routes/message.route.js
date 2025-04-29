import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getMessages, getUsersforsidebar ,sendMessage} from '../controller/message.controller.js';

//controller

//middleware


const router=express.Router();


router.get("/users",authenticate,getUsersforsidebar);
router.get("/:id", authenticate, getMessages);
router.post("/send/:id",authenticate,sendMessage);

export default router;



