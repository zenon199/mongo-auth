
import express, { json } from  'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from './database/db.js';
import router from './router/user.js';

const app = express();
dotenv.config();
app.use(express.json());

// Importing routes
import userRoutes from "./router/user.js"

// Using routes
app.use("/api/v1",userRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`);
    connectDb();
});