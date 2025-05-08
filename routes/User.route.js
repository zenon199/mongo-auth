import { getMe, login, logOut, registerUser, verifyUser,  } from "../controllers/User.controller.js";
import express from 'express'
import { isLogged } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/register', registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", login);
router.get("/me", isLogged, getMe);
router.get("/logout", isLogged, logOut);



export default router 