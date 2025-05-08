import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date
    }
}, 
{
    timestamps: true
})

UserSchema.pre("save", async function (next) {
  if(this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
    next();   
})

const User = mongoose.model('User', UserSchema)

export default User