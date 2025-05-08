
import User from "../models/User.model.js";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req , res) => {
    //get data
    //validate data via zod 
    //check user alredy exist
    //create user
    //create a vrification token
    //send token as email mailtrap resend noswemailer
    //send success message

    
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({
                message: "All fields required"
            })
        }
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
        console.log(token);

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
                ${process.env.BASE_URL}/api/v1/users/verify/${token}
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

export const verifyUser = async (req, res) => {
    //get token from url
    //validate token
    //find user baased on token
    //if not
    //isverified to true
    //remove verification token

    const {token} = req.params;
    console.log(token);
    if(!token) {
        return res.status(400).json({
            message: "Token not found"
        })
    }
    try {
    
    const user = await User.findOne({verificationToken: token})

    if(!user) {
        return res.status(400).json({
            message: "Invalid token"
        })
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
        message: "Account verified successfully",
        success: true
    })

    } catch (error) {
        res.status(400).json({
            message: "Error in Verification",
            error,
            success: false
        })
    }
}

export const login = async (req , res) => {
    const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log(isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if(!user.isVerified) {
        return res.status(400).json({
            message: "Account not verified"
        })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },

      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
        message: "Errror in on login",
        error,
        success: false
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if(!user) {
      return res.status(400).json({
        message: "User not found",
        success: false
      })
    }
    console.log(user);
    res.status(200).json({
      success: true,
      user
    })

  } catch (error) {
    res.status(400).json({
      message: "Error in fetching profile",
      error,
      success: false
  })
}
}

export const logOut = async (req, res) => {
  try {
    res.cookie('token','', {}) // expires: new Date(0)

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    })
  } catch (error) {
    res.status(400).json({
      message: "Error in logging out",
      error,
      success: false
  })
  }
}

export const forgotPass = async (req, res) => {
  try {
    
  } catch (error) {
    
  }
}

export const resetPass = async (req, res) => {
  try {
    
  } catch (error) {
    
  }
}