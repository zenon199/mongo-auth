import { registerUser } from "../controllers/User.controller.js";
import express from 'express'

const router = express.Router();

router.post('/register', registerUser)

export default router