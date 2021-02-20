const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const { ApolloServer, makeExecutableSchema} = require('apollo-server-express');
const serviceAccount = require('./burger-builder-react-eb8cd-firebase-adminsdk-93542-e6040b421d.json');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const os = require("os");
const path = require("path");
const cors = require("cors")({ origin: true });
const Busboy = require("busboy");
const fs = require("fs");

const {Storage} = require('@google-cloud/storage');

const gcs = new Storage({
    projectId: 'burger-builder-react-eb8cd',
    keyFilename: './burger-builder-react-eb8cd-firebase-adminsdk-93542-e6040b421d.json'
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const app = express();
const server = new ApolloServer({schema});

server.applyMiddleware({app, path: '/', cors: true});

exports.graphql = functions.region('europe-west3').https.onRequest(app);

exports.uploadFile = functions.region('europe-west3').https.onRequest((req, res) => {
cors(req, res, () => {
    if (req.method !== "POST") {
    return res.status(500).json({
        message: "Not allowed"
    });
    }
    const busboy = new Busboy({ headers: req.headers });
    let uploadData = null;
    let folderPath = '';


    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const filepath = path.join(os.tmpdir(), filename);
    if(mimetype.includes('image')){
        folderPath = 'images/';
    } else if(mimetype.includes('audio')){
        folderPath = 'audios/';
    } else if(mimetype.includes('video')){
        folderPath = 'videos/';
    } else if(mimetype.includes('application')){
        folderPath = mimetype.split('/')[1] + '/';
    } else {
        folderPath = 'others/';
    }
    uploadData = { file: filepath, type: mimetype, fieldname: filename };
    file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on("finish", () => {
    const bucket = gcs.bucket("burger-builder-react-eb8cd.appspot.com");
    bucket.upload(uploadData.file, {
        destination: folderPath + uploadData.fieldname
    }, function(err, file) {
        if (err) {
            res.status(500).json({
                error: err
            });
            return;
        }
        res.status(200).json({
            message: "file uploaded...",
            file: file.metadata.mediaLink,
            //type: uploadData.type
        });
      });
    });
    
    busboy.end(req.rawBody);
});
});