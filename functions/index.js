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
const crypto = require("crypto");

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
    let uploadData = [];    
    const bucket = gcs.bucket("burger-builder-react-eb8cd.appspot.com");

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        let folderPath = '';
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
        let nnewFileName = filename;
        const newName = crypto.randomBytes(20).toString('hex');
        const list = nnewFileName.split('.');
        nnewFileName = newName + '.' + list[list.length - 1];
        bucket.getFiles((err, files) => {
            if (!err) {
                // files is an array of File objects.
                let isExis = true;
                //let coun = 1;
                while (isExis) {
                    isExis = false;
                    files.forEach(fi => {
                        if(fi.metadata.name === folderPath + nnewFileName){
                            isExis = true;
                            console.log("File exist");                        
                            const newName = crypto.randomBytes(20).toString('hex');
                            const list = nnewFileName.split('.');
                            nnewFileName = newName + '.' + list[list.length - 1];
                        }          
                    });   
                    // console.log(coun);
                    // coun++;
                }                
            }
            uploadData.push({ 
                file: filepath, 
                folderPath: folderPath,
                type: mimetype, 
                oldName: filename, 
                fieldname: nnewFileName 
            });
            file.pipe(fs.createWriteStream(filepath));
        });          
    });

    busboy.on("finish", () => {
        let finalUploadData = [];
        let newUploadData = [...uploadData];
        newUploadData.forEach((data, index, array) => {
            bucket.upload(data.file, {
                destination: data.folderPath + data.fieldname
            }, function(err, file) {
                if (err) {
                    finalUploadData.push({
                        message: "file not uploaded...",
                        fileName: data.oldName,
                        filePath: null
                    });
                } else {
                    finalUploadData.push({
                        message: "file uploaded...",
                        fileName: data.oldName,
                        filePath: file.metadata.mediaLink,
                    });
                }
                console.log(index);
                const newFinalUploadData = [...finalUploadData];
                if (newFinalUploadData.length === array.length) {
                    res.status(200).json({
                        data: [newFinalUploadData],
                    }); 
                }
            });             
        });
    });
    
    busboy.end(req.rawBody);
});
});