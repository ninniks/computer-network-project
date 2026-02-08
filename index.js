import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';

import { connectDatabase } from './config/database.config.js';
import { configurePassport } from './config/passport.config.js';
import { configureSocket } from './config/socket.config.js';

import authRoutes from './routes/auth.routes.js';
import createMeetingRoutes from './routes/meeting.routes.js';
import userRoutes from './routes/user.routes.js';
import notificationRoutes from './routes/notification.routes.js';

await connectDatabase();

configurePassport();

const app = express();
const http = createServer(app);
app.use(morgan('tiny'))

const io = new Server(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header', 'Authorization'],
    credentials: true
  }
});

configureSocket(io);

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Solo passport.initialize(), NO session
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Sign In with Google</a>');
});

app.use(authRoutes);
app.use(userRoutes);
app.use(notificationRoutes);
app.use(createMeetingRoutes(io));

http.listen(8000, () => {
  console.info('Express server is running on port 8000');
});
