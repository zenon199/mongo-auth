import express from 'express';
import { login, logOut, me, refreshAccessToken, register, verify } from '../controllers/user.Controller';
import { isLoggedIn } from '../middlewares/isAuth';


const router = express.Router();

router.post('/register', register);
router.get('/verify/:token', verify);
router.post('/login', login);
router.post('/refresh-access-token', refreshAccessToken);
router.get('/me', isLoggedIn, me);
router.post('/logout', isLoggedIn, logOut);

export default router