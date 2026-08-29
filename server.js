import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`server is runnig on port ${port}`);

})

// connect to databse

import { connectDB } from './config/db.js';
connectDB();


// middleware
app.use(express.json());

// routes

import authRouter from './routes/authRoutes.js';
import blogRouter from './routes/blogRoutes.js';

app.use('/api/auth', authRouter);
app.use('/api/blogs', blogRouter);