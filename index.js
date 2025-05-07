import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import db from './utils/db.js'

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

const port = process.env.PORT || 4000;

// DB connect
db();

//User routes
app.use('/api/v1/users/', userRoutes)

app.listen(port, () => {
    console.log('Server is running on 3000');
})