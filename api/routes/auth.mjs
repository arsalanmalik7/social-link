import express from 'express';
import { client } from '../../mongodb.mjs';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import {
    stringToHash,
    varifyHash,
    validateHash
} from 'bcrypt-inzi'



const db = client.db('cruddb');
const usersCollection = db.collection("usersCollection");
const otpCollection = db.collection("otpCollection");

let router = express.Router()


router.post('/signup', async (req, res, next) => {
    console.log("Sign up to this page ");

    if (
        !req.body.firstName
        || !req.body.lastName
        || !req.body.email
        || !req.body.password

    ) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            firstName: "firstName",
            lastName: "lastName",
            email: "some@email.com",
            password: "some$password"
        } `);
        return;
    }


    //  req.body.email = req.body.email.toLowerCase();

    try {
        const result = await usersCollection.findOne({ email: req.body.email.toLowerCase() });
        console.log("result ", result)

        const hashPassword = await stringToHash(req.body.password);

        if (!result) {
            const insertedUser = await usersCollection.insertOne({
                isAdmin: false,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email.toLowerCase(),
                password: hashPassword,
                profilePic: req.body.profilePic || null,
                coverPic: req.body.coverPic || null,
                createdOn: new Date()
            })
            console.log("insertedUser ", insertedUser);
            res.status(200).send({ message: "Signup Successfully!" });
        } else {
            res.status(403).send({ message: "user already exist" })
        }
    } catch (error) {
        console.log("error getting data mongodb: ", error);
        res.status(500).send('server error, please try later');

    }
})


router.post('/login', async (req, res, next) => {
    if (
        !req.body.email
        || !req.body.password
    ) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            email: "some@email.com",
            password: "some$password",
        } `);
        return;
    }

    req.body.email = req.body.email.toLowerCase()

    try {
        const result = await usersCollection.findOne({ email: req.body.email });

        if (!result) {
            res.status(403).send({ message: "email or password incorect" })
        } else {
            const isMatch = await varifyHash(req.body.password, result.password)

            if (isMatch) {

                const token = jwt.sign({
                    isAdmin: false,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: req.body.email,
                    _id: result._id
                }, process.env.SECRET, {
                    expiresIn: '24h'
                })

                const expiresCookie = new Date();
                expiresCookie.setHours(expiresCookie.getHours() + 1)
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite:"lax",
                    path: '/',
                    expires: new Date(Date.now() + 86400000)
                })

                res.send({
                    message: "Login Successful",
                    data: {
                        isAdmin: result.isAdmin,
                        firstName: result.firstName,
                        lastName: result.lastName,
                        email: req.body.email,
                        profilePic: result.profilePic,
                        createdOn: result.createdOn,
                        _id: result._id
                    }
                });
                return;
            } else {
                res.status(401).send({
                    message: "email or password incorrect"
                })
            }
        }
    } catch (error) {

        console.log("error getting data", error)
        res.status(500).send("server error, please try later")
    }

})

router.post('/logout', async (req, res, next) => {
    res.clearCookie('token');
    res.send({ message: "Logout Successful" });
})


router.post(`/forget-password`, async (req, res) => {
    if (!req.body.email) {
        res.status(403);
        res.send({ message: 'required parameters missing, email is required' });
        return;
    };

    req.body.email = req.body.email.toLowerCase();

    try {

        const user = await usersCollection.findOne({ email: req.body.email });

        if (!user) {
            res.status(403).send({ message: "user not found" });
            return;
        };

        const otpCode = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        console.log("otpCode: ", otpCode);

        const otpCodeHash = await stringToHash(otpCode);

        const insertOtp = await otpCollection.insertOne({
            email: req.body.email,
            otpCodeHash: otpCodeHash,
            createdAt: new Date()
        });

        console.log("insertOtp: ", insertOtp);

        res.send({
            message: "OTP sent successfully",
            data: {
                otpCode: otpCode,
            }
        });

    } catch (error) {
        console.log("error inserting data into mongodb: ", error);
        res.status(500).send('server error, please try later');
        return;

    };

});

router.post(`/forget-password-complete`, async (req, res) => {
    if (
        !req.body.email
        || !req.body.otpCode
        || !req.body.newPassword
    ) {
        res.status(403);
        res.send({ message: 'required parameters missing, email, otp and newPassword are required' });
        return;
    };
    req.body.email = req.body.email.toLowerCase();

    try {
        const user = await usersCollection.findOne({ email: req.body.email });

        if (!user) {
            res.status(403).send({ message: "user not found" });
            return;
        };

        const otp = await otpCollection.findOne({ email: req.body.email }, { sort: { _id: -1 } });

        if (!otp) {
            res.status(403).send({ message: "Invalid OTP" });
            return;
        };

        const isValidOtp = await varifyHash(req.body.otpCode, otp.otpCodeHash);

        if (!isValidOtp) {
            res.status(403).send({ message: "Incorrect OTP" });
            return;
        };

        const newPasswordHash = await stringToHash(req.body.newPassword);

        const updatePassword = await usersCollection.updateOne(
            {
                email: otp.email
            }, {
            $set: {
                password: newPasswordHash
            }
        });
        console.log("updatePassword: ", updatePassword);

        res.send({ message: "password updated successfully" });

        return;


    } catch (error) {
        console.log("error getting data mongodb: ", error);
        res.status(500).send('server error, please try later');
        return;


    }

});

export default router