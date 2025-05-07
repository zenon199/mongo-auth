import User from "../models/User.model.js";
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const registerUser = async (req , res) => {
    //get data
    //validate data via zod 
    //check user alredy exist
    //create user
    //create a vrification token
    //send token as email mailtrap resend noswemailer
    //send success message

    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        return res.status(400).json({
            message: "All fields required"
        })
    }
    try {
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).status({
                message: "User already exist"
            })
        }
        const user = await User.create({
            name,
            email,
            password
        })
        console.log(user)
        if(!user) {
            return res.status(400).json({
                message: "User not register"
            })
        }
        const token = crypto.randomBytes(32).toString("hex")
        user.verificationToken = token;
        await user.save();

        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
              user: process.env.MAILTRAP_USERNAME,
              pass: process.env.MAILTRAP_PASSWORD,
            },
          });


        const mailOptions= {
            from: process.env.MAILTRAP_SENDERMAIL,
            to: user.email,
            subject: "Verify your Account",
            text: `Please click on the following link:
                ${process.env.BASE_URL}/api/vi/users/verify${token}
            `
        }

        transporter.sendMail(mailOptions);

        res.status(200).json({
            message: "User registered successfully",
            success: true
        });

    } catch (error) {
        res.status(400).json({
            message: "User  not registerd",
            error,
            success: false
        })
    }
}