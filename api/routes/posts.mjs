import express from 'express';
import { client } from '../../mongodb.mjs';
import { ObjectId } from 'mongodb';
import { OpenAI } from 'openai';
import admin from 'firebase-admin';
import multer, { diskStorage } from 'multer';
import 'dotenv/config'
import fs, { copyFileSync } from 'fs';
import { globalObject, socketUsers } from '../../core.mjs';

const db = client.db('cruddb');
const col = db.collection("posts");
const userCollection = db.collection("usersCollection");
let router = express.Router()



const storage = diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        console.log("file: ", file);
        cb(null, file.originalname);
    }
})

let upload = multer({ storage: storage })

let serviceAccount = {
    "type": "service_account",
    "project_id": "blogging-app-8",
    "private_key_id": "04ab28067909b079f6618e0824207b28de585a72",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyqn0Epf5fZNmx\n8FGgO6OMkaiBEKTpl8s508blZ+IG5MQCnEsTwlhfcPeeXzPNj6nfI7d9y4PLM1Lr\n5AYyWU4n78o6mDrZMFIEbw/IoHy741F2x5koZLndzTyI6tQ8Jn50vvGwtI8MwMjR\nNWJruD7E12GF8Cetk2E59HR3XLKF0MiyYmuBQJm/PXO02cbcfshV2u5380cWM5A8\n8Rus/EyHeX4E0WgLUerMZ0Ao0g31sd8Kr4NIZpu97lv7J1Rgq3gr3SdEKuOKM46K\nxwnFEwVfGzCZZtqijqav+LePX24s7355qwE8ZS5XDC1WqA+EtvPi+oK4t8KM6PdW\nb8J/rX29AgMBAAECggEAFtUdVXT+KUQ64tfGoq7Ec6Ags9/D53tH1CvJiQMp2j4t\ng3TkTlHhl87YwjNB7ETuDU9j8W5K+TKlp/IzzYbmq0lkY3EVYjCf5qOn1XiXAC7o\neADBhK08qIkEMa4q8cXslrBZND8a4eMYNs429fOth9vLgYGjnHXPcMfaA3AD+4Aw\ne4MJr8LWHOg5+fxjqANKjUPY8Hp4vep37hnpuugGx2VMtKcUJYa/BSkC4ESMFvgv\nTGBWulqEobyug4E4l+BlqRsy62gkXm+Q1EtprfH9D8jQaY2agKnaZDnR1YjD2SYX\nwJsY7lYWigI30mQp8hUJBYm5nq5hFxKcjAJa4sJ06QKBgQDl7ASuvzU5znZDpaxv\npGRyPiCjYEsa74J50w5zkfwlN5E5o59erjSZ+ZeeMj2q/KsghOe30IaQBPA6zrPg\nEfipzw4qAxdpmDxdfNxmVBJL3fLUCr/M9qMGTvlFVaoSfv1rFD93ozWYvuqtwJsA\njn0FGw4Fec4+wUqGpSxCJCJi9QKBgQDG7jVqFRmRqhVPnMl59e+p8Rw+iPYKeHcf\nlNP/Zot95qxFJTFeyRnIrTaviKKascxwRWda5vP7quRerrmOFknquGOrnbxcm1m4\nskWDQHlJDPLVgw9QLPHp7yW6hOISj1u1RtAD6Ui+gwo4P7GzbmnTroX5DLEcntdA\nZtZ9dTtCqQKBgFjthJIiGnAVTuCzP5KevssBBJasM+BjKs/7tec1W5T5fQ4SHx37\nuxSi2OWzAO8VcwrM3OLXoHQrtM7KDABqcwcaspvFPlT1MMPn+0cI1VrKqZUh4zVf\nX4adHQSYMYOd4l58ImAfnCdMEHDLwifg9LH42N99USwsjqqtUAT0/OfRAoGBALR/\nHugKDREmCgAaepS2mabQppf3HYeSlkOJfnGWUasCyfxTKuCeB08WGzBaAW/rM1wL\nHSRVubr37A4c6zAI+TiH5aepj2dXbakv1/KnZWTq4sroB9TvcvCXlNwQBjBg8w0g\nG03xNZfmvjcbU9lCrbLr/5Nh+LHHTfeZV7St0f9BAoGACjo98lshzVuLxXiR0rXl\nxHbs6084v6ZngE3/yTyDl4Q8mY/beveeiKZ/pJERsEqNvDaYzxGiAzgYtofvOjJD\nC+H6a2lg6XfvTnbyA5fJi7PTMg1DUTZFmSP0JZ+fgcUeKiZ6qHrrl8CB0KE0UwFe\nczNHKDt7vEwwaPh63yWhk0I=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-v2pb4@blogging-app-8.iam.gserviceaccount.com",
    "client_id": "105250110650933293678",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-v2pb4%40blogging-app-8.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"

}


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),

})

const bucket = admin.storage().bucket('gs://blogging-app-8.appspot.com');

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




router.post(
    '/post',
    (req, res, next) => {
        req.decoded = { ...req.body.decoded };
        next();
    },
    upload.any(),
    async (req, res, next) => {
        console.log('req.body: ', req.body);

        // if (!req.body.text) {
        //     res.status(403);
        //     res.send({ message: 'text is required' });
        //     return;
        // }

        console.log('req.files: ', req.files);

        let imgUrl = null;

        if (req.files.length > 0) {
            if (req.files[0].size > 2000000) {
                res.status(403);
                res.send({ message: 'file size is too big, file must be less than 2MB' });
                return;
            }

            try {
                const uploadResponse = await bucket.upload(req.files[0].path, {
                    destination: `posts/${req.files[0].originalname}`,
                });

                imgUrl = await uploadResponse[0].getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491',
                });

                fs.unlinkSync(req.files[0].path);
            } catch (error) {
                console.log('error uploading or getting signed URL: ', error);
                res.status(500).send('server error, please try later');
                return;
            }
        }

        try {
            const insertResponse = await col.insertOne({
                text: req.body.text,
                img: imgUrl || null,
                authorEmail: req.decoded.email,
                authorId: new ObjectId(req.decoded._id),
                likes: [],
                comments: [],
                createdOn: new Date(),
            });

            console.log('insertResponse: ', insertResponse);
            res.status(200).send('Post created successfully');
        } catch (error) {
            console.log('error inserting data into MongoDB: ', error);
            res.status(500).send('server error, please try later');
        }
    }
);


router.get('/feed', async (req, res, next) => {

    const page = parseInt(req.query.page) || 0

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
                img: 1,
                text: 1,
                createdOn: 1,
                likes: { $ifNull: ["$likes", []] },
                comments: { $ifNull: ["$comments", []] },
                authorObject: {
                    firstName: { $ifNull: ['$authorObject.firstName', null] },
                    lastName: { $ifNull: ['$authorObject.lastName', null] },
                    email: { $ifNull: ['$authorObject.email', null] },
                    profilePic: { $ifNull: ['$authorObject.profilePic', null] },
                    createdOn: { $ifNull: ['$authorObject.createdOn', null] },
                    _id: { $ifNull: ['$authorObject._id', null] }
                },
            },

        },
        {
            $sort: { _id: -1 }
        },
        {
            $skip: page
        },
        {
            $limit: 10
        },

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

    const userId = req.query._id;

    const cursor = col.find({ authorId: new ObjectId(userId) });
    let results = await cursor.sort({ _id: -1 }).toArray();
    console.log(results);
    res.send(results);

})

router.get('/post/:postId', async (req, res, next) => {
    const postId = req.params.postId;
    console.log("postId: ", postId);

    if (!ObjectId.isValid(postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    };


    try {
        const cursor = col.aggregate([
            {
                $match: {
                    _id: new ObjectId(postId)
                }
            },
            {
                $lookup: {
                    from: 'usersCollection',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorObject',
                },
            },
            {
                $unwind: {
                    path: '$authorObject',
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $project: {
                    _id: 1,
                    img: 1,
                    text: 1,
                    createdOn: 1,
                    likes: { $ifNull: ["$likes", []] },
                    comments: { $ifNull: ["$comments", []] },
                    authorObject: {
                        firstName: { $ifNull: ['$authorObject.firstName', null] },
                        lastName: { $ifNull: ['$authorObject.lastName', null] },
                        email: { $ifNull: ['$authorObject.email', null] },
                        profilePic: { $ifNull: ['$authorObject.profilePic', null] },
                        createdOn: { $ifNull: ['$authorObject.createdOn', null] },
                        _id: {
                            $ifNull: ['$authorObject._id', null]

                        },
                    },

                }
            },

        ])
        const result = await cursor.toArray();
        if (!result) {
            res.status(404).send(`Post not found`);
            return;
        }
        console.log("result: ", result);
        res.send(result);
    } catch (error) {
        console.error("Error finding post:", error);
        res.status(500).send("Error finding post");
    }

});

router.post(`/post/:postId/comment`, async (req, res) => {
    const postId = req.params.postId;
    console.log('postId: ', postId);

    if (!ObjectId.isValid(postId)) {
        res.status(403).send({ message: 'postId is not valid' });
        return;
    }

    try {
        const comment = {
            text: req.body.text,
            authorId: new ObjectId(req.body.decoded._id),
            authorEmail: req.body.decoded.email,
            authorName: req.body.decoded.firstName + ' ' + req.body.decoded.lastName,
            authorProfilePic: req.body.profilePic,
            createdOn: new Date()
        }
        const insertedComment = await col.updateOne({ _id: new ObjectId(postId) }, { $push: { comments: comment } });
        console.log('insertedComment: ', insertedComment);
        res.status(200).send('comment added successfully');


    } catch (error) {
        console.log("error inserting comment into mongodb: ", error);
        res.status(500).send('server error, please try later');

    }

});



const getProfileMiddleware = async (req, res, next) => {

    const userId = req.params.userId || req.body.decoded._id;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }


    try {

        const result = await userCollection.findOne({ _id: new ObjectId(userId) });
        console.log("profileResult: ", result);

        res.send({
            message: "profile fetched",
            data: {
                isAdmin: result.isAdmin,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                profilePic: result.profilePic,
                coverPic: result.coverPic,
                _id: result._id
            }
        })
    } catch (error) {

        console.log("error getting data mongodb: ", error);
        res.status(500).send('server error, please try later');
    }

}

router.get(`/profile`, getProfileMiddleware);
router.get(`/profile/:userId`, getProfileMiddleware);


router.put('/post/:postId', upload.any(), async (req, res, next) => {
    if (!ObjectId.isValid(req.params.postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }

    let updatedData = {};
    if (req.body.text) { updatedData.text = req.body.text }

    if (req.files.length > 0) {
        if (req.files[0].size > 2000000) {
            res.status(403);
            res.send({ message: 'file size is too big, file must be less than 2MB' });
            return;
        }

        try {
            const uploadResponse = await bucket.upload(req.files[0].path, {
                destination: `posts/${req.files[0].originalname}`,
            });

            updatedData.img = await uploadResponse[0].getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
            });

            fs.unlinkSync(req.files[0].path);
        } catch (error) {
            console.log('error uploading or getting signed URL: ', error);
            res.status(500).send('server error, please try later');
            return;
        }
    }


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


router.get(`/users`, async (req, res, next) => {

    try {

        const result = await userCollection.find({}, {
            projection: {
                password: 0,
            }
        }).toArray();
        console.log("users: ", result);

        res.send({
            message: "all users for messeges fetched",
            data: result
        })
    } catch (error) {

        console.log("error getting data mongodb: ", error);
        res.status(500).send('server error, please try later');
    }
})

router.put(`/profile/:userId`, upload.any(), async (req, res, next) => {

    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }
    console.log("req.files: ", req.files);

    let profilePicUrl = null;

    if (req.files.length > 0) {
        if (req.files[0].size > 3000000) {
            res.status(403);
            res.send({ message: 'file size is too big, file must be less than 3MB' });
            return;
        }

        try {
            const uploadResponse = await bucket.upload(req.files[0].path, {
                destination: `profiles/${req.files[0].originalname}`,
            });

            profilePicUrl = await uploadResponse[0].getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
            });

            fs.unlinkSync(req.files[0].path);
        } catch (error) {
            console.log('error uploading or getting signed URL: ', error);
            res.status(500).send('server error, please try later');
            return;
        }

    }
    const updatedData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        profilePic: profilePicUrl,
    }

    try {
        const updateResponse = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: updatedData });
        console.log("updateResponse: ", updateResponse);
        res.send("profile updated");

    } catch {

        console.log("error updating data mongodb: ", error);
        res.status(500).send('server error, please try later');
        return;

    }



});

router.put(`/profile/:userId/coverPic`, upload.any(), async (req, res) => {
    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    let coverPic = null

    if (req.files.length > 0) {
        if (req.files[0].size > 3000000) {
            res.status(403);
            res.send({ message: 'file size is too big, file must be less than 3MB' });
            return;
        }

        try {
            const uploadResponse = await bucket.upload(req.files[0].path, {
                destination: `coverPics/${req.files[0].originalname}`,
            });

            coverPic = await uploadResponse[0].getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
            });

            fs.unlinkSync(req.files[0].path);
        } catch (error) {
            console.log('error uploading or getting signed URL: ', error);
            res.status(500).send('server error, please try later');
            return;
        }

    }
    const updatedData = {
        coverPic: coverPic,
    };
    try {
        const updateResponse = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: updatedData });
        console.log("updateResponse: ", updateResponse);
        res.send("profile updated");

    } catch {
        console.log("error updating data mongodb: ", error);
        res.status(500).send('server error, please try later');
        return;

    }

})


router.post(`/post/:postId/like`, async (req, res) => {
    if (!ObjectId.isValid(req.params.postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }
    const postId = req.params.postId;
    try {
        const likeResponse = await col.updateOne(
            { _id: new ObjectId(postId) },
            {
                $addToSet: {
                    likes: {
                        userId: req.currentUser._id,
                        likedAt: new Date(),
                        likedByFirstName: req.currentUser.firstName,
                        likedByLastName: req.currentUser.lastName,
                        likedByProfilePic: req.body.profilePic,
                    },
                },
            }
        );


        globalObject.io.emit('postLike', {
            postId: postId,
            like: {
                userId: req.currentUser._id,
                likedAt: new Date(),
                likedByFirstName: req.currentUser.firstName,
                likedByLastName: req.currentUser.lastName,
                likedByProfilePic: req.body.profilePic,
            },
        });


        console.log("likeResponse: ", likeResponse);
        res.send("Post liked!")



    } catch (error) {

        console.log("error updating data mongodb: ", error);
        res.status(500).send('server error, please try later');
        return;

    }
});

router.post(`/post/:postId/unlike`, async (req, res) => {
    if (!ObjectId.isValid(req.params.postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }
    const postId = req.params.postId;
    try {
        const unlikeResponse = await col.updateOne(
            { _id: new ObjectId(postId) },
            { $pull: { likes: { userId: req.currentUser._id } } }
        );


        globalObject.io.emit('postUnlike', {
            postId: postId,
            like: {
                userId: req.currentUser._id,
                likedAt: new Date(),
                likedByFirstName: req.currentUser.firstName,
                likedByLastName: req.currentUser.lastName,
                likedByProfilePic: req.body.profilePic,
            },
        });


        console.log("unlikeResponse: ", unlikeResponse);
        res.send("Post unliked!")



    } catch (error) {

        console.log("error updating data mongodb: ", error);
        res.status(500).send('server error, please try later');
        return;

    }
})

export default router;