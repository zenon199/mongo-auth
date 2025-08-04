import express from 'express';
import { forgotPassword, login, logOut, me, refreshAccessToken, register, verify, verifyForgotPassword } from '../controllers/user.Controller';
import { isLoggedIn } from '../middlewares/isAuth';


const router = express.Router();

router.post('/register', register);
router.get('/verify/:token', verify);
router.post('/login', login);
router.post('/refresh-access-token', refreshAccessToken);
router.get('/me', isLoggedIn, me);
router.post('/logout', isLoggedIn, logOut);
router.post('/forgot-pass', forgotPassword);
router.post('/verify-forgot-pass/:token', verifyForgotPassword);


export default router