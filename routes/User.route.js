import { login, registerUser, verifyUser,  } from "../controllers/User.controller.js";
import express from 'express'

const router = express.Router();

router.post('/register', registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", verifyUser, login);

export default router 