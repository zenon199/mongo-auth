
import bcrypt from 'bcrypt';
import {z} from "zod";
import jwt from "jsonwebtoken"
import { User } from "../database/User.js"
import tryCatch from '../middlewares/tryCatch.js';


export const register = async (req,res) => {
    try{
        const requireBody = z.object({
            email: z.string().email().min(3).max(100),
            name: z.string().min(1).max(100),
            password: z.string().min(8).max(30),
        })

        const successParsed = requireBody.safeParse(req.body);

        if(!successParsed.success){
            res.json({
                message: "Not followed the input rules.",
                error: successParsed.error,
            })
        }

        const {email, name, password} = req.body;
        let user = await User.findOne({email});

        if(user) return res.status(400).json({
            message: "User already exists."})

        const hashedPassword = await bcrypt.hash(password,5);

        await User.create({
            name: name,
            email: email,
            password: hashedPassword
        })

        res.json({
            message: "User registered successfully."
        })
        
    }catch(e){
        res.status(500).json({
            message: e.message
        })
    }
}

export const login = tryCatch(async (req, res) => {
    const  {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        res.status(500).json({
            message: "No user with this email"
        })
    }

    const matchPassword = await bcrypt.compare(password,user.password);

    if(!matchPassword) {
        res.status(400).json({
            message: "Password Incorrect."
        })
    }

    const token = jwt.sign({id: user._id.toString()}, process.env.JWT_SEC)
        expiresIn: "10d",
    res.json({
        message: `Welcome back ${user.name}`,
        token,
        user
    })

})