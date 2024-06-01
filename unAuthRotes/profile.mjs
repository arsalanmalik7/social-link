import express from 'express';
import { client } from './../mongodb.mjs'
import { ObjectId } from 'mongodb'
import OpenAI from "openai";

const db = client.db("cruddb");
const col = db.collection("posts");
const userCollection = db.collection("usersCollection");


let router = express.Router()

// const openaiClient = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });



// router.get('/search', async (req, res, next) => {

//     try {
//         const response = await openaiClient.embeddings.create({
//             model: "text-embedding-ada-002",
//             input: req.query.q,
//         });
//         const vector = response?.data[0]?.embedding
//         console.log("vector: ", vector);



//         const documents = await col.aggregate([
//             {
//                 "$search": {
//                     "index": "vectorIndex",
//                     "knnBeta": {
//                         "vector": vector,
//                         "path": "embedding",
//                         "k": 10
//                     },
//                     "scoreDetails": true

//                 }
//             },
//             {
//                 "$project": {
//                     "embedding": 0,
//                     "score": { "$meta": "searchScore" },
//                     "scoreDetails": { "$meta": "searchScoreDetails" }
//                 }
//             }
//         ]).toArray();

//         documents.map(eachMatch => {
//             console.log(`score ${eachMatch?.score?.toFixed(3)} => ${JSON.stringify(eachMatch)}\n\n`);
//         })
//         console.log(`${documents.length} records found `);

//         res.send(documents);

//     } catch (e) {
//         console.log("error getting data mongodb: ", e);
//         res.status(500).send('server error, please try later');
//     }

// })



router.get('/posts', async (req, res, next) => {

    const userId = req.query._id

    if (!ObjectId.isValid(userId) && userId !== undefined) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    const cursor = col.find({ authorId: new ObjectId(userId) })
        .sort({ _id: 1 })
        .limit(5);

    try {
        let results = await cursor.toArray()
        console.log("results: ", results);
        res.send(results);
    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})

router.get(`/profile/:userId`, async (req, res, next) => {

    const userId = req.params.userId;
    console.log("userId: ", userId);

    if (!ObjectId.isValid(userId) && userId !== undefined) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    try {
        let result = await userCollection.findOne({ _id: new ObjectId(userId) });
        console.log("myresult: ", result);
        res.send({
            message: 'profile fetched',
            data: {
                firstName: result?.firstName,
                lastName: result?.lastName,
                profilePic: result?.profilePic,
                email: result?.email,
            }
        });
    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})

router.use((req, res) => {
    res.status(401).send({ message: "this token is invalid " })
    console.log("this token is invalid");
    return;
})


export default router;