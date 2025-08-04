import { Request, Response } from "express"
import { z } from "zod"
import Crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.Model"
import sendVerificationMail from "../utils/sendMail"

interface JwtUserPayload extends jwt.JwtPayload {
    id: string;
    email?: string;
}

const requireKey = (key: string) => {
    const v = process.env[key];
    if (!v) {
        throw new Error(`{key} is not set.`)
        return v;
    }
}

const JWT_SECRET = requireKey('JWT_SECRET')
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "10m";
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "1d";

const ACCESS_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 15, // 15m
  sameSite: "strict" as const,
};

const REFRESH_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
  sameSite: "strict" as const,
};

const CLEAR_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

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
        const existingUser = await User.findOne({ email });

        //can save a DB call here
        if (existingUser) {
            res.status(400).json({
                message: 'User already exists',
                success: false
            })
            return
        }

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
            { id: user._id.toString(), email: user.email },
            JWT_SECRET as string,
            { expiresIn:JWT_ACCESS_EXPIRY } as any
        );

        const refreshToken = jwt.sign(
            { id: user._id.toString(), email: user.email },
            JWT_SECRET as string,
            { expiresIn: JWT_REFRESH_EXPIRY} as any
        );

        res.cookie("accessToken", accessToken, ACCESS_COOKIE);
        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE);
        
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
        const decodedRaw = jwt.verify(refreshToken, JWT_SECRET as string)

        if (typeof decodedRaw !== 'object' || decodedRaw === null || !('id' in decodedRaw)) {
            res.status(401).json({
                message: 'Invalid refresh token',
                success: false
            })
            return
        }

        const decoded = decodedRaw as JwtUserPayload;

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({
                message: 'Refresh token not recognized',
                success: false
            })
        }

        const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            JWT_SECRET as string,
            { expiresIn: JWT_ACCESS_EXPIRY } as any
        )

        res.cookie("accessToken", newAccessToken, ACCESS_COOKIE);

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
    const payload = req.user as JwtUserPayload;
    try {
        if (!payload.id) {
            res.status(401).json({
                message: "Unauthorized",
                success: false
            })
            return
        }
    
        const user = await User.findById(payload.id).select(
            "-password -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordTokenExpiry -refreshToken"
        )
    
        if (!user) {
            res.status(401).json({
                message: "User not found",
                success: false
            })
            return
        }
    
        res.status(200).json({
            message: "User found",
            success: true,
            user
        })
    } catch (error) {
        console.log('Error in fetching user', error)
        res.status(500).json({
            message: 'Internal server error',
            success: false
        })
    }
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