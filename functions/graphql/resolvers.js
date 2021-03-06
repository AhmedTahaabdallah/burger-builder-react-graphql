const admin = require('firebase-admin');
const { getAllOrdersProcess} = require('./orders/getAllOrders');
const { createNewOrder} = require('./orders/createNewOrder');
const { getAllIngredients} = require('./others/getAllIngredients');
const { createNewUser} = require('./users/createuser');
const { userLogin } = require('./users/userlogin');
const GraphQLJSON = require('graphql-type-json');

const resolvers = {
    JSON: GraphQLJSON,
    Query: {
        getAllIngredients: async(_, __, { req }) => {
            const data = await getAllIngredients(admin);
            return data;
        },
        getAllOrders: async(_, __, { req }) => {
            //console.log('accept-language : ', req.headers['accept-language']);
            //console.log('Authorization : ', req.headers['authorization']);
            //console.log('headers : ', req.headers);
            const data = await getAllOrdersProcess(admin, req);
            return data;
        },        
    },
    Mutation: {        
        createNewOrder: async(_, { price, deliveryMethod, email, name, country, street, zipCode, ingredients }, { req }) => {
            //console.log(req.headers);
            console.log('accept-language : ', req.headers['accept-language']);
            const data = await createNewOrder(admin, req, price, deliveryMethod, email, name, country, street, zipCode, ingredients);
            return data;
        },
        createNewUser: async(_, { username, email, password }, { req }) => {
            //console.log(req.headers);
            //console.log('accept-language : ', req.headers['accept-language']);
            const data = await createNewUser(admin, username, email, password);
            return data;
        },
        userLogin: async(_, { email, password }, { req }) => {
            //console.log(req.headers);
            //console.log('accept-language : ', req.headers['accept-language']);
            const data = await userLogin(admin, email, password);
            return data;
        },
    },    
};

module.exports = resolvers;