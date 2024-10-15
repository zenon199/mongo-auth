
import mongoose from "mongoose";

 export const connectDb = async () => {
    try{
    await mongoose.connect(process.env.db)
    console.log("Database connected successfuly.")
    }catch(e){
        console.log(e);
    }
}