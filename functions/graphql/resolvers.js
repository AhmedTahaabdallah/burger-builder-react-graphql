const admin = require('firebase-admin');
const { getAllOrdersProcess} = require('./orders/getAllOrders');
const { createNewOrder} = require('./orders/createNewOrder');

const resolvers = {
    Query: {
        getAllOrders: async(_, __, { req }) => {
            console.log('accept-language : ', req.headers['accept-language']);
            console.log('Authorization : ', req.headers['authorization']);
            //console.log('headers : ', req.headers);
            const data = await getAllOrdersProcess(admin);
            return data;
        },
    },
    Mutation: {
        createNewOrde: async(_, { price, deliveryMethod, email, name, country, street, zipCode, bacon, cheese, meat, salad }, { req }) => {
            //console.log(req.headers);
            console.log('accept-language : ', req.headers['accept-language']);
            const data = await createNewOrder(admin, price, deliveryMethod, email, name, country, street, zipCode, bacon, cheese, meat, salad);
            return data;
        }
    },    
};

module.exports = resolvers;