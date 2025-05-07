import mongoose from "mongoose";



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
