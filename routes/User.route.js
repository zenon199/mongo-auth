import { registerUser } from "../controllers/User.controller.js";
import express from 'express'

const router = express.Router();

router.get('/register', registerUser)

export default router