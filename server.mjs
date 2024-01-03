import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import path from 'path';
import cors from 'cors';
import { Server as socketIo } from 'socket.io';
import { createServer } from 'http';
import cookie from 'cookie';


import { client } from './mongodb.mjs';
import postRouter from './api/routes/posts.mjs';
import authRouter from './api/routes/auth.mjs';
import chatRouter from './api/routes/chat.mjs';
import { globalObject, socketUsers } from './core.mjs';

import UnAuthRouter from './unAuthRotes/profile.mjs'


const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: [
            'http://localhost:3000',
            'http://192.168.0.109:3000',
            '*'
        ],
        credentials: true,
        methods: "GET,POST,PUT,DELETE",
    }
));

app.use(`/api`, authRouter);

app.use(`/api`, (req, res, next) => {
    console.log("cookies; ", req.cookies)

    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        console.log("decoded: ", decoded);


        req.body.decoded = {
            _id: decoded._id,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            email: decoded.email,
            profilePic: decoded.profilePic,
            isAdmin: decoded.isAdmin,
        };
        req.currentUser = {
            _id: decoded._id,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            email: decoded.email,
            profilePic: decoded.profilePic,
            isAdmin: decoded.isAdmin,
        };
        next();

    } catch (error) {
        UnAuthRouter(req, res);
        return;

    }

})




app.use('/api', postRouter);
app.use('/api', chatRouter);


app.use(`/`, express.static(path.join(__dirname, '/frontend/build')))
app.get(`*`, (req, res) => {
    res.sendFile(path.join(__dirname + '/frontend/build/index.html'))
})




const server = createServer(app);

const io = new socketIo(server, {
    cors: {
        origin: ['*', 'http://localhost:3000'],
        methods: "*",
        credentials: true,
    }
});

globalObject.io = io;

io.use((socket, next) => {
    console.log('Socket Middleware');

    const parsedCookies = cookie.parse(socket.request.headers.cookie || "")

    console.log("parsedCookies: ", parsedCookies.token);

    try {
        const decoded = jwt.verify(parsedCookies.token, process.env.SECRET);
        console.log("decoded: ", decoded);

        socketUsers[decoded._id] = socket;

        socket.on('disconnect', (reason, decs) => {
            console.log('user disconnected event: ', reason, decs);
        });
        next();

    } catch (error) {
        return next(new Error('Authentication error'));
    }

});

io.on('connection', (socket) => {
    console.log('socket connection event: ', socket.id);

    socket.on('disconnect', (reason, decs) => {
        console.log('user disconnected event: ', reason, decs);
    });

})




const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
    console.log(`posting app listening on ${PORT} `)
})