import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();



const db = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("DB connected");  
    })
    .catch((err) => {
        console.log("ERROR in DB connection")
    })
}

export default db
