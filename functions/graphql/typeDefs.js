const typeDefs = `
    scalar JSON

    type CustomerAddress {
        country: String
        street: String
        zipCode: String
    }

    type Customer {
        email: String
        name: String
        address: CustomerAddress
    }

    type oneOrder {
        id: String!
        price: Float
        deliveryMethod: String
        ingredients: JSON
        customer: Customer
    }

    type oneOrderOutput {
        status: String
        msg: String
        orderId: String
    }

    type allIngredients {
        totalPrice: Float
        ingredients: JSON
    }

    type authUser {
        status: String
        msg: String
        id: String
        tokken: String
        username: String
    }

    type allOrders {
        status: String
        msg: String
        allOrders: [oneOrder]
    }

    type Query {
        getAllIngredients: allIngredients
        getAllOrders: allOrders
    }

    type Mutation {
        createNewOrder(price: Float!, deliveryMethod: String!, email: String!, name: String!, country: String!, street: String!, zipCode: String!, ingredients: JSON): oneOrderOutput!
        createNewUser(username: String!, email: String!, password: String!): authUser!
        userLogin(email: String!, password: String!): authUser!
    }
`;

module.exports = typeDefs;