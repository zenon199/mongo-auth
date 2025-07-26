import express from 'express';
import { login, refreshAccessToken, register, verify } from '../controllers/user.Controller';


const router = express.Router();

router.post('/register', register);
router.get('/verify/:token', verify);
router.post('/login', login);
router.post('/refresh-access-token', refreshAccessToken);

export default router