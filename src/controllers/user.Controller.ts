import { Request, Response } from "express"
import { z } from "zod"
import Crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.Model"
import sendVerificationMail from "../utils/sendMail"
const register = async (req: Request, res: Response) => {
    try {
        const parsedData = z.object({
            name: z.string()
                .min(2, 'Name must be at least 2 characters')
                .max(50, 'Name must be at most 50 characters')
                .regex(/[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
            email: z.string()
                .email('Invalid email address'),
            password: z.string()
                .min(6, 'Password must be at least 6 characters')
                .max(20, 'Password must be at most 20 characters')
                .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
                .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .regex(/[0-9]/, 'Password must contain at least one number')
                .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
        }).safeParse(req.body);
    
        if (!parsedData.success) {            
            res.status(400).json({
                message: 'Invalid inputs',
                error: parsedData.error.flatten().fieldErrors,
                success: false
            })
            return
        }

        const { name, email, password } = parsedData.data;
        // const existingUser = await User.findOne({ email });

        // if (existingUser) {
        //     res.status(400).json({
        //         message: 'User already exists',
        //         success: false
        //     })
        //     return
        // }

        const token: string = Crypto.randomBytes(32).toString('hex');
        const tokenExpiry: number = Date.now() + 10 * 60 * 1000; //10 minutes

        const user = await User.create({
            name,
            email,
            password,
            verificationToken: token,
            verificationTokenExpiry: tokenExpiry
        });

        await sendVerificationMail(user.email, user.verificationToken as string)

        res.status(201).json({
            message: 'User created successfully, Check email for verification',
            success: true
        })
    } catch (error) {
        console.log('Error registering user', error)
        res.status(500).json({
            message: 'Internal server error',
            success: false
        })
    }
}
const verify = async (req: Request, res: Response) => {
    const token = req.params.token;

    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: {$gt: Date.now()}
        })

        if (!user) {
            res.status(400).json({
                message: 'Invalid token',
                success: false
            })
            return 
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;

        await user.save();

        res.status(200).json({
            message: 'User verified successfully',
            success: true
        })
    } catch (error) {
        console.log('Error verifying user', error)
        res.status(500).json({
            message: 'Internal server error',
            success: false
        })
    }
}
const login = async (req: Request, res: Response) => {
    const parsedData = z.object({
        email: z.string()
            .email('Invalid email address'),
        password: z.string()
            .min(6, 'Password must be at least 6 characters')
            .max(20, 'Password must be at most 20 characters')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    }).safeParse(req.body);

    if (!parsedData.success) {            
        res.status(400).json({
            message: 'Invalid inputs',
            error: parsedData.error.flatten().fieldErrors,
            success: false
        })
        return
    }

    const { email, password } = parsedData.data;
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({
                message: 'User not found',
                success: false
            })
            return
        }

        if (!user.isVerified) {
            res.status(400).json({
                message: 'User not verified',
                success: false
            })
            return
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({
                message: 'Invalid credentials',
                success: false
            })
            return
        }

        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_ACCESS_EXPIRY || "10m") } as any
        );

        const refreshToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_REFRESH_EXPIRY || "1d") } as any
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 15, // 15 minutes
            sameSite: "strict" as const
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7,// 7 days
            sameSite: "strict" as const
        });
        
        res.status(200).json({
            message: 'Login successful',
            success: true,
            // user: {
            //     id: user._id,
            //     email: user.email
            // },
            // accessToken,
            // refreshToken
            
        })

    } catch (error) {
        console.log('Error logging in user', error)
        res.status(500).json({
            message: 'Internal server error',
            success: false
        })
    }
}

const refreshAccessToken = async (req: Request, res: Response) => { 
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        res.status(401).json({
            message: 'No refresh token found',
            success: false
        })
        return
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string)

        if (typeof decoded !== 'object' || decoded === null || !('id' in decoded)) {
            res.status(401).json({
                message: 'Invalid refresh token',
                success: false
            })
            return
        }

        const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_ACCESS_EXPIRY || "10m") } as any
        )

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 15, // 15 minutes
            sameSite: "strict" as const
        });

        res.status(200).json({
            message: 'Access token refreshed successfully',
            success: true,
            accessToken: newAccessToken
        })

    } catch (error) {
        console.log('Error in refreshing access token', error)
        res.status(500).json({
            message: 'Internal server error',
            success: false
        })
    }
}

const me = async (req: Request, res: Response) => {
    
}
const logOut = async (req: Request, res: Response) => {
    
}
const forgotPassword = async (req: Request, res: Response) => {
    
}
const verifyForgotPassword = async (req: Request, res: Response) => {
    
}

export {
    register,
    verify,
    login,
    refreshAccessToken,
    me,
    logOut,
    forgotPassword,
    verifyForgotPassword
}