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
const {deletOneStorageFile} = require('./helper/deletonestoragefile');

const gcs = new Storage({
    projectId: 'burger-builder-react-eb8cd',
    keyFilename: './burger-builder-react-eb8cd-firebase-adminsdk-93542-e6040b421d.json'
});

const bucketValue = "burger-builder-react-eb8cd.appspot.com";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

const app = express();
const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
        return {
            req
        };
    },
});

server.applyMiddleware({app, path: '/', cors: true});

const graphqlFileRuntimeOpts = {
    timeoutSeconds: 120,
    memory: '1GB'
};

exports.graphql = functions.runWith(graphqlFileRuntimeOpts).region('europe-west3').https.onRequest(app);

const uploadOneFileRuntimeOpts = {
    timeoutSeconds: 540,
    memory: '4GB'
};

exports.uploadOneFile = functions.runWith(uploadOneFileRuntimeOpts).region('europe-west3').https.onRequest((req, res) => {
    cors(req, res, () => {
        if (req.method !== "POST") {
        return res.status(500).json({
            message: "Not allowed"
        });
        }
        const busboy = new Busboy({ headers: req.headers });
        let uploadData = null;    
        let oldPath = null;    
        const bucket = gcs.bucket(bucketValue);

        busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated) => {
            if(fieldname === 'oldPath'){
                oldPath = val;
            }
        });

        busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
            // const reqJson = JSON.parse(req.body);
            // console.log('reqJson : ',reqJson);
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
                uploadData = { 
                    file: filepath, 
                    folderPath: folderPath,
                    type: mimetype, 
                    oldName: filename, 
                    fieldname: nnewFileName 
                };
                file.pipe(fs.createWriteStream(filepath));
            });          
        });

        busboy.on("finish", () => {
            bucket.upload(uploadData.file, {
                destination: uploadData.folderPath + uploadData.fieldname
            }, async(err, file) => {
                if (err) {
                    res.status(500).json({
                        message: "file not uploaded...",
                        filePath: null
                    }); 
                } 
                if(oldPath !== null 
                && oldPath.startsWith('https://storage.googleapis.com')){
                    const resultt = await deletOneStorageFile(bucket, oldPath);
                    console.log(`resultt ${resultt}`);
                }
                res.status(200).json({
                    message: "file uploaded...",
                    filePath: file.metadata.mediaLink,
                }); 
            });
        });
        
        busboy.end(req.rawBody);
    });
});

const uploadFilesRuntimeOpts = {
    timeoutSeconds: 540,
    memory: '4GB'
};

exports.uploadFiles = functions.runWith(uploadFilesRuntimeOpts).region('europe-west3').https.onRequest((req, res) => {
    cors(req, res, () => {
        if (req.method !== "POST") {
        return res.status(500).json({
            message: "Not allowed"
        });
        }
        const busboy = new Busboy({ headers: req.headers });
        let uploadData = [];    
        const bucket = gcs.bucket(bucketValue);

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
                }, (err, file) => {
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