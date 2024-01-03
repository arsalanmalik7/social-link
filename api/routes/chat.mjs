import express from 'express';
import { client } from '../../mongodb.mjs';
import { ObjectId } from 'mongodb';
import multer from 'multer';
import fs from 'fs';


const db = client.db('cruddb');
const messagesCollection = db.collection("messagesCollection");
const col = db.collection("posts");
const userCollection = db.collection("usersCollection");
import { globalObject, socketUsers } from '../../core.mjs';


const router = express.Router();

router.post('/message', multer().none(), async (req, res) => {

    console.log('req.body: ', req.body);
    console.log('req.currentUser: ', req.currentUser);

    if (!req.body.receiver_id || !req.body.messageText) {
        res.send({
            message: `reciver_id and messageText are required
            required parameters are:
             reciver_id, messageText,
             messageText: 'some text'
            `,
        });
        return;
    }

    if (!ObjectId.isValid(req.body.receiver_id)) {

        res.send({
            message: `reciver_id is not valid`,
        });
        return;

    };

    try {

        const newMessage = {
            sender_id: req.currentUser._id,
            sender_name: req.currentUser.firstName + ' ' + req.currentUser.lastName,
            sender_email: req.currentUser.email,

            receiver_id: req.body.receiver_id,

            messageText: req.body.messageText,
            createdAt: new Date(),
        };

        const insertedResponse = await messagesCollection.insertOne(newMessage);
        console.log('insertedResponse: ', insertedResponse);

        newMessage._id = insertedResponse.insertedId;


        if (socketUsers[req.body.receiver_id]) {
            console.log('this user is online: ', req.body.receiver_id);

            socketUsers[req.body.receiver_id].emit("NEW_MESSAGE", newMessage);

            socketUsers[req.body.receiver_id].emit(
                'NOTIFICATIONS',
                `New message from ${req.currentUser.firstName} ${req.currentUser.lastName}`

            );

        } else {
            console.log('This user is not online');
        };


        res.send({ message: 'message sent' });
        return;


    } catch (error) {

        console.log("error sending message mongodb: ", e);
        res.status(500).send({ message: 'server error, please try later' });
    };


});

router.get(`/messages/:sender_id`, async (req, res, next) => {

    if (!req.params.sender_id) {
        res.status(403).send({ message: 'sender_id is required' });
    };

    if (!ObjectId.isValid(req.params.sender_id)) {
        res.status(403).send({ message: 'sender_id is not valid' });
    };

    const cursor = messagesCollection.find({
        $or: [
            {
                sender_id: req.params.sender_id,
                receiver_id: req.currentUser._id
            },
            {
                sender_id: req.currentUser._id,
                receiver_id: req.params.sender_id
            }
        ]
    })
        .sort({ _id: -1 })
        .limit(30);

    try {

        let messages = await cursor.toArray();
        console.log('messages: ', messages);
        res.send({
            message: 'messages fetched',
            messages
        });

    } catch (error) {
        console.log('error: ', error);
        res.status(500).send('server error, please try later');
    }


});

router.get(`/chatuser/:chatUserId`,(req, res)=>{
    const chatUserId = req.params.chatUserId;
    console.log('chatUserId: ', chatUserId);

    if (!ObjectId.isValid(chatUserId)) {
        res.status(403).send({ message: 'chatUserId is not valid' });
        return;
    }

    try {
        const user = userCollection.findOne({ _id: new ObjectId(chatUserId) });
        console.log('user: ', user);
        res.send({
            message: 'user fetched',
            userObject: {
                firstName:  user.firstName,
                lastName: user.lastName,
                profilePicUrl: user.profilePicUrl,
            }
        });
        return;
    
    } catch (error) {
        console.log('error: ', error);
        res.status(500).send('server error, please try later');
        return;

    }
});


export default router;


