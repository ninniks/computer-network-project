import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';

import './models/User.js';
import './models/Booking.js';
import './services/passport.js';

import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

const url = "mongodb+srv://admin:"+process.env.MONGO_PASSWORD+"@cluster0.ayla2.mongodb.net/"+process.env.DB_NAME+"?retryWrites=true&w=majority";
await mongoose.connect(url);

const app = express();
const http = createServer(app);

const io = new Server(http, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//using cookie session
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [process.env.COOKIE_KEY]
    })
);

//inizialize passport for cookies
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) =>{
    res.send('<a href="/auth/google">Sign In with Google</a>');
});

authRoutes(app);
apiRoutes(app, io);

http.listen(8000);
