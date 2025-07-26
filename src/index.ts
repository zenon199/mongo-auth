import express, { urlencoded } from 'express';
import CookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './utils/db';


import userRouter from './routes/user.Route';


dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(CookieParser());
app.use(cors({
    origin: process.env.BASE_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))


app.get('/', (req, res) => {
    res.send('Hello from server')
})

app.use('/api/v1/users', userRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
})