import express from 'express'
import { client } from '../../mongodb.mjs'
import { ObjectId } from 'mongodb'
import { OpenAI } from 'openai'


const db = client.db('cruddb');
const col = db.collection("posts");
const userCollection = db.collection("usersCollection");

let router = express.Router()




const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});





router.get('/search', async (req, res, next) => {

    try {
        const response = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: req.query.q,
        });
        const vector = response?.data[0]?.embedding
        console.log("vector: ", vector);
        // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

        // Query for similar documents.
        const documents = await col.aggregate([
            {
                "$search": {
                    "index": "default",
                    "knnBeta": {
                        "vector": vector,
                        "path": "embedding",
                        "k": 10 // number of documents
                    },
                    "scoreDetails": true

                }
            },
            {
                "$project": {
                    "embedding": 0,
                    "score": { "$meta": "searchScore" },
                    "scoreDetails": { "$meta": "searchScoreDetails" }
                }
            }
        ]).toArray();

        documents.map(eachMatch => {
            console.log(`score ${eachMatch?.score?.toFixed(3)} => ${JSON.stringify(eachMatch)}\n\n`);
        })
        console.log(`${documents.length} records found `);

        res.send(documents);

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }

})




router.post('/post', async (req, res, next) => {
    // console.log('this is the post request');

    if (
        !req.body.title || !req.body.text
    ) {
        res.status(403).send(`required parameters are: {
            title: "abc posts title",
            text: "some posts text"
        } `);
        return;
    }

    const insertResponse = await col.insertOne({
        title: req.body.title,
        text: req.body.text,
        authorEmail: req.body.decoded.email,
        authorId: new ObjectId(req.body.decoded._id),
        createdOn: new Date()
    })
    console.log("insertResponse: ", insertResponse)

    res.send("Post created!")

})

router.get('/feed', async (req, res, next) => {





    const cursor = col.aggregate([
        {
            $lookup: {
                from: "usersCollection",
                localField: 'authorId',
                foreignField: '_id',
                as: 'authorObject',
            },
        },

        {
            $unwind: {
                path: "$authorObject",
                preserveNullAndEmptyArrays: true
            }

        },
        {

            $project: {
                _id: 1,
                title: 1,
                text: 1,
                createdOn: 1,
                likes: { $ifNull: ["$likes", []] },
                authorObject: {
                    firstName: { $ifNull: ['$authorObject.firstName', null] },
                    lastName: { $ifNull: ['$authorObject.lastName', null] },
                    email: { $ifNull: ['$authorObject.email', null] },
                },
            },

        },
        // {
        //     $sort: { _id: -1 }
        // },
        // {
        //     $skip: 0
        // },
        // {
        //     $limit: 100
        // },

    ])

    try {
        let results = await cursor.toArray();
        console.log(results);
        res.send(results);

    } catch (error) {

        console.log("error getting data mongodb: ", error);
        res.status(500).send('server error, please try later');

    }

})


router.get('/posts', async (req, res, next) => {

    const cursor = col.find({});
    let results = await cursor.toArray();
    console.log(results);
    res.send(results);

})

router.get('/post/:postId', async (req, res, next) => {

    const postId = req.params.postId;

    try {
        const postId = await col.findOne({ _id: new ObjectId(req.params.postId) });
        if (postId) {
            console.log(postId);
            res.send(postId);
        } else {
            res.status(404).send("Post not found ");
        }
    } catch (error) {
        console.error("Error finding post:", error);
        res.status(500).send("Error finding post");
    }

})



router.get(`/profile`, async (req, res, next) => {

    try {

        const result = await userCollection.findOne({ email: req.body.decoded.email });
        console.log("profileResult: ", result);

        res.send({
            message: "profile fetched",
            data: {
                isAdmin: result.isAdmin,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
            }
        })
    } catch (error) {

        console.log("error getting data mongodb: ", error);
        res.status(500).send('server error, please try later');
    }
})


router.put('/post/:postId', async (req, res, next) => {
    if (!ObjectId.isValid(req.params.postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }

    let updatedData = {};
    if (req.body.title) { updatedData.title = req.body.title }
    if (req.body.text) { updatedData.text = req.body.text }

    try {

        const updatedPost = col.updateOne(
            { _id: new ObjectId(req.params.postId) },
            { $set: updatedData }
        );
        if (updatedPost) {
            console.log("Post updated:", await updatedPost);
            res.send("Post updated!");
        } else {
            res.status(404).send("Post not found " + req.params.postId);
        }
    } catch (error) {
        console.error("Error finding post:", error);
        res.status(500).send("Error finding post");
    }
})




router.delete(`/post/:postId`, async (req, res, next) => {
    if (!ObjectId.isValid(req.params.postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }

    const postId = await col.findOne({ _id: new ObjectId(req.params.postId) });
    const filter = { _id: postId }


    try {
        const deleteResponse = await col.deleteOne({ _id: new ObjectId(req.params.postId) })
        console.log("deleteResponse; ", deleteResponse);
        res.send("Post deleted!")
    } catch (error) {
        console.log("error deleting mongodb: ", error);
        res.status(500).send('server error, please try later');
    }

})
export default router