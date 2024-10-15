
import express from "express";
import { login, register } from "../controller/user.js";

const router = express();

router.post("/user/register",register);
router.post("/user/login",login);

export default router;