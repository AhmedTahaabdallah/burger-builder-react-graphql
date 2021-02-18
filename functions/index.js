const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const { ApolloServer, makeExecutableSchema} = require('apollo-server-express');
const serviceAccount = require('./burger-builder-react-eb8cd-firebase-adminsdk-93542-e6040b421d.json');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

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

exports.graphql = functions.https.onRequest(app);
