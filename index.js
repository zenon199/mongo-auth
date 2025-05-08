import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import db from './utils/db.js'
import cookieParser from 'cookie-parser'

//import all routes
import userRoutes from './routes/User.route.js'

dotenv.config();
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']

}))
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const port = process.env.PORT || 4000;

// DB connect
db();

app.get("/",(req, res) => {
    res.send("Hii this is Auth Server")
})

//User routes
app.use('/api/v1/users', userRoutes)


app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})