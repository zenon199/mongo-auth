import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
   
},{
    timestamps:true,
});

export const User = mongoose.model("User",Schema);