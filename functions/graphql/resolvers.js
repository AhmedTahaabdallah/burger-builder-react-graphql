const admin = require('firebase-admin');
const { getAllOrdersProcess} = require('./orders/getAllOrders');
const { createNewOrder} = require('./orders/createNewOrder');

const resolvers = {
    Query: {
        getAllOrders: async() => {
            const data = await getAllOrdersProcess(admin);
            return data;
        },
    },
    Mutation: {
        createNewOrde: async(_, { price, deliveryMethod, email, name, country, street, zipCode, bacon, cheese, meat, salad }, { dataSources }) => {
            //console.log(req.headers);
            const data = await createNewOrder(admin, price, deliveryMethod, email, name, country, street, zipCode, bacon, cheese, meat, salad);
            return data;
        }
    },
};

module.exports = resolvers;