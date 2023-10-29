import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import connectDB from "./config/DbConnection.js";

import authRouter from './router/authRouter.js'
import roleRouter from './router/roleRouter.js'
import communityRouter from './router/communityRouter.js'
import memberRouter from './router/memberRouter.js'

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json({
  parameterLimit: 100000,
  limit: '50mb'
}))
app.use(morgan());
app.disable('etag')

const allowedOrigins = ['http://localhost:3000'];
const corsOptions = {
    credentials: true,
    origin: allowedOrigins,
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization, Cookie'
};

app.use(cors());

await connectDB();

app.use('/v1', authRouter);
app.use('/v1', roleRouter);
app.use('/v1', communityRouter);
app.use('/v1', memberRouter);

const port = process.env.PORT || 8000;

const server = app.listen(port);
