import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import path from 'path';
import cors from 'cors';

import postRouter from './api/routes/posts.mjs';
import authRouter from './api/routes/auth.mjs';


const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: ['http://localhost:3000'],
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
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            email: decoded.email,
            isAdmin: decoded.isAdmin,
        };
        next();

    } catch (error) {

        res.status(401).send({
            message: "Invalid token"
        });
    }

})




app.use('/api', postRouter);


app.use(``, express.static(path.join(__dirname, './frontend/build')))
app.get(`*`, (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/build/'))
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`posting app listening on ${PORT} `)
})


